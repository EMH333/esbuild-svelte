import type { CompileOptions, ModuleCompileOptions, CompileResult } from "svelte/compiler";
import type { PreprocessorGroup } from "svelte/compiler";
import type { Plugin } from "esbuild";
type Warning = CompileResult["warnings"][number];
interface esbuildSvelteOptions {
    /**
     * Svelte compiler options
     */
    compilerOptions?: CompileOptions;
    /**
     * Svelte compiler options for module files (*.svelte.js and *.svelte.ts)
     */
    moduleCompilerOptions?: ModuleCompileOptions;
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
export default function sveltePlugin(options?: esbuildSvelteOptions): Plugin;
export {};
