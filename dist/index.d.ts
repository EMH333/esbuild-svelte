import type { CompileOptions } from 'svelte/types/compiler/interfaces';
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess';
import type { Plugin } from 'esbuild';
interface esbuildSvelteOptions {
    compileOptions?: CompileOptions;
    preprocessor?: PreprocessorGroup | PreprocessorGroup[];
}
export default function sveltePlugin(options?: esbuildSvelteOptions): Plugin;
export {};
