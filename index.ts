//original version from https://github.com/evanw/esbuild/blob/plugins/docs/plugin-examples.md
import { preprocess, compile, VERSION } from "svelte/compiler";
import { dirname, basename, relative } from "path";
import { promisify } from "util";
import { readFile, statSync } from "fs";
import { originalPositionFor, TraceMap } from "@jridgewell/trace-mapping";

import type { CompileOptions, Warning } from "svelte/types/compiler/interfaces";
import type { PreprocessorGroup } from "svelte/types/compiler/preprocess";
import type { OnLoadResult, Plugin, PluginBuild, Location, PartialMessage } from "esbuild";

interface esbuildSvelteOptions {
    /**
     * Svelte compiler options
     */
    compilerOptions?: CompileOptions;

    /**
     * The preprocessor(s) to run the Svelte code through before compiling
     */
    preprocess?: PreprocessorGroup | PreprocessorGroup[];

    /**
     * Attempts to cache compiled files if the mtime of the file hasn't changed since last run.
     *
     */
    cache?: boolean;

    /**
     * Should esbuild-svelte create a binding to an html element for components given in the entryPoints list
     * Defaults to `false` for now until support is added
     */
    fromEntryFile?: boolean;

    /**
     * The regex filter to use when filtering files to compile
     * Defaults to `/\.svelte$/`
     */
    include?: RegExp;

    /**
     * A function to filter out warnings
     * Defaults to a constant function that returns `true`
     */
    filterWarnings?: (warning: Warning) => boolean;
}

interface CacheData {
    data: OnLoadResult;
    // path, last modified time
    dependencies: Map<string, Date>;
}

async function convertMessage(
    { message, start, end }: Warning,
    filename: string,
    source: string,
    sourcemap: any,
): Promise<PartialMessage> {
    let location: Partial<Location> | undefined;
    if (start && end) {
        let lineText = source.split(/\r\n|\r|\n/g)[start.line - 1];
        let lineEnd = start.line === end.line ? end.column : lineText.length;

        // Adjust the start and end positions based on what the preprocessors did so the positions are correct
        if (sourcemap) {
            sourcemap = new TraceMap(sourcemap);
            const pos = originalPositionFor(sourcemap, {
                line: start.line,
                column: start.column,
            });
            if (pos.source) {
                start.line = pos.line ?? start.line;
                start.column = pos.column ?? start.column;
            }
        }

        location = {
            file: filename,
            line: start.line,
            column: start.column,
            length: lineEnd - start.column,
            lineText,
        };
    }
    return { text: message, location };
}

//still support old incremental option if possible, but can still be overriden by cache option
const shouldCache = (
    build: PluginBuild & {
        initialOptions: {
            incremental?: boolean;
            watch?: boolean;
        };
    },
) => build.initialOptions?.incremental || build.initialOptions?.watch;

const SVELTE_FILTER = /\.svelte$/;
const FAKE_CSS_FILTER = /\.esbuild-svelte-fake-css$/;

export default function sveltePlugin(options?: esbuildSvelteOptions): Plugin {
    const svelteFilter = options?.include ?? SVELTE_FILTER;
    const svelteVersion = VERSION.split(".").map((v) => parseInt(v))[0];
    return {
        name: "esbuild-svelte",
        setup(build) {
            if (!options) {
                options = {};
            }
            // see if we are incrementally building or watching for changes and enable the cache
            // also checks if it has already been defined and ignores this if it has
            if (options.cache == undefined && shouldCache(build)) {
                options.cache = true;
            }

            // disable entry file generation by default
            if (options.fromEntryFile == undefined) {
                options.fromEntryFile = false;
            }

            // by default all warnings are enabled
            if (options.filterWarnings == undefined) {
                options.filterWarnings = () => true;
            }

            //Store generated css code for use in fake import
            const cssCode = new Map<string, string>();
            const fileCache = new Map<string, CacheData>();

            //check and see if trying to load svelte files directly
            build.onResolve({ filter: svelteFilter }, ({ path, kind }) => {
                if (kind === "entry-point" && options?.fromEntryFile) {
                    return { path, namespace: "esbuild-svelte-direct-import" };
                }
            });

            //main loader
            build.onLoad(
                { filter: svelteFilter, namespace: "esbuild-svelte-direct-import" },
                async (args) => {
                    return {
                        errors: [
                            {
                                text: "esbuild-svelte does not support creating entry files yet",
                            },
                        ],
                    };
                },
            );

            //main loader
            build.onLoad({ filter: svelteFilter }, async (args) => {
                let cachedFile = null;
                let previousWatchFiles: string[] = [];

                // if told to use the cache, check if it contains the file,
                // and if the modified time is not greater than the time when it was cached
                // if so, return the cached data
                if (options?.cache === true && fileCache.has(args.path)) {
                    cachedFile = fileCache.get(args.path) || {
                        dependencies: new Map(),
                        data: null,
                    }; // should never hit the null b/c of has check
                    let cacheValid = true;

                    //for each dependency check if the mtime is still valid
                    //if an exception is generated (file was deleted or something) then cache isn't valid
                    try {
                        cachedFile.dependencies.forEach((time, path) => {
                            if (statSync(path).mtime > time) {
                                cacheValid = false;
                            }
                        });
                    } catch {
                        cacheValid = false;
                    }

                    if (cacheValid) {
                        return cachedFile.data;
                    } else {
                        fileCache.delete(args.path); //can remove from cache if no longer valid
                    }
                }

                //reading files
                let originalSource = await promisify(readFile)(args.path, "utf8");
                let filename = relative(process.cwd(), args.path);

                //file modification time storage
                const dependencyModifcationTimes = new Map<string, Date>();
                dependencyModifcationTimes.set(args.path, statSync(args.path).mtime); // add the target file

                let compilerOptions = {
                    css: "external" as "external",
                    ...options?.compilerOptions,
                };

                //actually compile file
                try {
                    let source = originalSource;

                    //do preprocessor stuff if it exists
                    if (options?.preprocess) {
                        let preprocessResult = null;

                        try {
                            preprocessResult = await preprocess(
                                originalSource,
                                options.preprocess,
                                {
                                    filename,
                                },
                            );
                        } catch (e: any) {
                            // if preprocess failed there are chances that an external dependency caused exception
                            // to avoid stop watching those files, we keep the previous dependencies if available
                            if (cachedFile) {
                                previousWatchFiles = Array.from(cachedFile.dependencies.keys());
                            }
                            throw e;
                        }

                        if (preprocessResult.map) {
                            // normalize the sourcemap 'source' entrys to all match if they are the same file
                            // needed because of differing handling of file names in preprocessors
                            let fixedMap = preprocessResult.map as { sources: Array<string> };
                            for (let index = 0; index < fixedMap?.sources.length; index++) {
                                if (fixedMap.sources[index] == filename) {
                                    fixedMap.sources[index] = basename(filename);
                                }
                            }
                            compilerOptions.sourcemap = fixedMap;
                        }
                        source = preprocessResult.code;

                        // if caching then we need to store the modifcation times for all dependencies
                        if (options?.cache === true) {
                            preprocessResult.dependencies?.forEach((entry) => {
                                dependencyModifcationTimes.set(entry, statSync(entry).mtime);
                            });
                        }
                    }

                    let { js, css, warnings } = compile(source, { ...compilerOptions, filename });

                    //esbuild doesn't seem to like sourcemaps without "sourcesContent" which Svelte doesn't provide
                    //so attempt to populate that array if we can find filename in sources
                    if (compilerOptions.sourcemap) {
                        if (js.map.sourcesContent == undefined) {
                            js.map.sourcesContent = [];
                        }

                        for (let index = 0; index < js.map.sources.length; index++) {
                            const element = js.map.sources[index];
                            if (element == basename(filename)) {
                                js.map.sourcesContent[index] = originalSource;
                                index = Infinity; //can break out of loop
                            }
                        }
                    }

                    let contents = js.code + `\n//# sourceMappingURL=` + js.map.toUrl();

                    //if svelte emits css seperately, then store it in a map and import it from the js
                    if (
                        (compilerOptions.css === false || compilerOptions.css === "external") &&
                        css?.code
                    ) {
                        let cssPath = args.path
                            .replace(".svelte", ".esbuild-svelte-fake-css") //TODO append instead of replace to support different svelte filters
                            .replace(/\\/g, "/");
                        cssCode.set(
                            cssPath,
                            css.code + `/*# sourceMappingURL=${css.map.toUrl()} */`,
                        );
                        contents = contents + `\nimport "${cssPath}";`;
                    }

                    if (options?.filterWarnings) {
                        warnings = warnings.filter(options.filterWarnings);
                    }

                    const result: OnLoadResult = {
                        contents,
                        warnings: await Promise.all(
                            warnings.map(
                                async (e) =>
                                    await convertMessage(
                                        e,
                                        args.path,
                                        source,
                                        compilerOptions.sourcemap,
                                    ),
                            ),
                        ),
                    };

                    // if we are told to cache, then cache
                    if (options?.cache === true) {
                        fileCache.set(args.path, {
                            data: result,
                            dependencies: dependencyModifcationTimes,
                        });
                    }

                    // make sure to tell esbuild to watch any additional files used if supported
                    // only provide if context API is supported or we are caching
                    if (build.esbuild?.context !== undefined || shouldCache(build)) {
                        result.watchFiles = Array.from(dependencyModifcationTimes.keys());
                    }

                    return result;
                } catch (e: any) {
                    let result: OnLoadResult = {};
                    result.errors = [
                        await convertMessage(
                            e,
                            args.path,
                            originalSource,
                            compilerOptions.sourcemap,
                        ),
                    ];
                    // only provide if context API is supported or we are caching
                    if (build.esbuild?.context !== undefined || shouldCache(build)) {
                        result.watchFiles = previousWatchFiles;
                    }
                    return result;
                }
            });

            //if the css exists in our map, then output it with the css loader
            build.onResolve({ filter: FAKE_CSS_FILTER }, ({ path }) => {
                return { path, namespace: "fakecss" };
            });

            build.onLoad({ filter: FAKE_CSS_FILTER, namespace: "fakecss" }, ({ path }) => {
                const css = cssCode.get(path);
                return css ? { contents: css, loader: "css", resolveDir: dirname(path) } : null;
            });

            // this enables the cache at the end of the build. The cache is disabled by default,
            // but if this plugin instance is used agian, then the cache will be enabled (because
            // we can be confident that the build is incremental or watch).
            // This saves enabling caching on every build, which would be a performance hit but
            // also makes sure incremental performance is increased.
            build.onEnd(() => {
                if (!options) {
                    options = {};
                }
                if (options.cache === undefined) {
                    options.cache = true;
                }
            });
        },
    };
}
