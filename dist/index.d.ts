import type { CompileOptions } from 'svelte/types/compiler/interfaces';
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess/types';
import type { Plugin } from 'esbuild';
interface esbuildSvelteOptions {
    /**
     * Svelte compiler options
     */
    compileOptions?: CompileOptions;
    /**
    * @deprecated Replaced by `preprocess`, will be removed in next breaking release
    */
    preprocessor?: PreprocessorGroup | PreprocessorGroup[];
    /**
     * The preprocessor(s) to run the Svelte code through before compiling
     */
    preprocess?: PreprocessorGroup | PreprocessorGroup[];
    /**
     * Attempts to cache compiled files if the mtime of the file hasn't changed since last run.
     * Only works with incremental or watch mode builds
     */
    cache?: boolean;
}
export default function sveltePlugin(options?: esbuildSvelteOptions): Plugin;
export {};
