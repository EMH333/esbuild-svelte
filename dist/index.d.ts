/// <reference types="svelte" />
import type { CompileOptions, Warning } from "svelte/types/compiler/interfaces";
import type { PreprocessorGroup } from "svelte/types/compiler/preprocess";
import type { Plugin } from "esbuild";
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
export default function sveltePlugin(options?: esbuildSvelteOptions): Plugin;
export {};
