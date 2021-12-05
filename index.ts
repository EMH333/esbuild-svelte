//original version from https://github.com/evanw/esbuild/blob/plugins/docs/plugin-examples.md
import { preprocess, compile } from "svelte/compiler";
import { dirname, basename, relative } from "path";
import { promisify } from "util";
import { readFile, statSync } from "fs";

import type { CompileOptions, Warning } from "svelte/types/compiler/interfaces";
import type { PreprocessorGroup } from "svelte/types/compiler/preprocess/types";
import type { OnLoadResult, Plugin } from "esbuild";

interface esbuildSvelteOptions {
    /**
     * Svelte compiler options
     */
    compileOptions?: CompileOptions;

    /**
     * The preprocessor(s) to run the Svelte code through before compiling
     */
    preprocess?: PreprocessorGroup | PreprocessorGroup[];

    /**
     * Attempts to cache compiled files if the mtime of the file hasn't changed since last run.
     * Only works with incremental or watch mode builds
     */
    cache?: boolean;

    /**
     * Should esbuild-svelte create a binding to an html element for components given in the entryPoints list
     * Defaults to `false` for now until support is added
     */
    fromEntryFile?: boolean;
}

interface CacheData {
    data: OnLoadResult;
    // path, last modified time
    dependencies: Map<string, Date>;
}

const convertMessage = ({ message, start, end, filename, frame }: Warning) => ({
    text: message,
    location: start &&
        end && {
            file: filename,
            line: start.line,
            column: start.column,
            length: start.line === end.line ? end.column - start.column : 0,
            lineText: frame,
        },
});

// TODO: Hot fix to replace broken e64enc function in svelte on node 16
const b64enc = (b: string) => Buffer.from(b).toString("base64");
function toUrl(data: string) {
    return "data:application/json;charset=utf-8;base64," + b64enc(data);
}

const SVELTE_FILTER = /\.svelte$/;
const FAKE_CSS_FILTER = /\.esbuild-svelte-fake-css$/;

export default function sveltePlugin(options?: esbuildSvelteOptions): Plugin {
    return {
        name: "esbuild-svelte",
        setup(build) {
            if (!options) {
                options = {};
            }
            // see if we are incrementally building or watching for changes and enable the cache
            // also checks if it has already been defined and ignores this if it has
            if (
                options.cache == undefined &&
                (build.initialOptions.incremental || build.initialOptions.watch)
            ) {
                options.cache = true;
            }

            // disable entry file generation by default
            if (options.fromEntryFile == undefined) {
                options.fromEntryFile = false;
            }

            //Store generated css code for use in fake import
            const cssCode = new Map<string, string>();
            const fileCache = new Map<string, CacheData>();

            //check and see if trying to load svelte files directly
            build.onResolve({ filter: SVELTE_FILTER }, ({ path, kind }) => {
                if (kind === "entry-point" && options?.fromEntryFile) {
                    return { path, namespace: "esbuild-svelte-direct-import" };
                }
            });

            //main loader
            build.onLoad(
                { filter: SVELTE_FILTER, namespace: "esbuild-svelte-direct-import" },
                async (args) => {
                    return {
                        errors: [
                            {
                                text: "esbuild-svelte does not support creating entry files yet",
                            },
                        ],
                    };
                }
            );

            //main loader
            build.onLoad({ filter: SVELTE_FILTER }, async (args) => {
                // if told to use the cache, check if it contains the file,
                // and if the modified time is not greater than the time when it was cached
                // if so, return the cached data
                if (options?.cache === true && fileCache.has(args.path)) {
                    const cachedFile = fileCache.get(args.path) || {
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

                let compileOptions = { css: false, ...options?.compileOptions };

                //actually compile file
                try {
                    let source = originalSource;

                    //do preprocessor stuff if it exists
                    if (options?.preprocess) {
                        let preprocessResult = await preprocess(
                            originalSource,
                            options.preprocess,
                            {
                                filename,
                            }
                        );
                        if (preprocessResult.map) {
                            // normalize the sourcemap 'source' entrys to all match if they are the same file
                            // needed because of differing handling of file names in preprocessors
                            let fixedMap = preprocessResult.map as { sources: Array<string> };
                            for (let index = 0; index < fixedMap?.sources.length; index++) {
                                if (fixedMap.sources[index] == filename) {
                                    fixedMap.sources[index] = basename(filename);
                                }
                            }
                            compileOptions.sourcemap = fixedMap;
                        }
                        source = preprocessResult.code;

                        // if caching then we need to store the modifcation times for all dependencies
                        if (options?.cache === true) {
                            preprocessResult.dependencies?.forEach((entry) => {
                                dependencyModifcationTimes.set(entry, statSync(entry).mtime);
                            });
                        }
                    }

                    let { js, css, warnings } = compile(source, { ...compileOptions, filename });

                    //esbuild doesn't seem to like sourcemaps without "sourcesContent" which Svelte doesn't provide
                    //so attempt to populate that array if we can find filename in sources
                    if (compileOptions.sourcemap) {
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

                    let contents = js.code + `\n//# sourceMappingURL=` + toUrl(js.map.toString());

                    //if svelte emits css seperately, then store it in a map and import it from the js
                    if (!compileOptions.css && css.code) {
                        let cssPath = args.path
                            .replace(".svelte", ".esbuild-svelte-fake-css")
                            .replace(/\\/g, "/");
                        cssCode.set(
                            cssPath,
                            css.code + `/*# sourceMappingURL=${toUrl(css.map.toString())} */`
                        );
                        contents = contents + `\nimport "${cssPath}";`;
                    }

                    const result: OnLoadResult = {
                        contents,
                        warnings: warnings.map(convertMessage),
                    };

                    // if we are told to cache, then cache
                    if (options?.cache === true) {
                        fileCache.set(args.path, {
                            data: result,
                            dependencies: dependencyModifcationTimes,
                        });
                    }

                    // make sure to tell esbuild to watch any additional files used if supported
                    if (build.initialOptions.watch) {
                        // this array does include the orignal file, but esbuild should be smart enough to ignore it
                        result.watchFiles = Array.from(dependencyModifcationTimes.keys());
                    }

                    return result;
                } catch (e: any) {
                    return { errors: [convertMessage(e)] };
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
        },
    };
}
