import { Plugin } from 'esbuild';
import { CompileOptions } from 'svelte/types/compiler/interfaces';
import { PreprocessorGroup } from 'svelte/types/compiler/preprocess'

interface esbuildSvelteOptions {
    compileOptions?: CompileOptions
    preprocessor?: PreprocessorGroup | PreprocessorGroup[]
}

declare function configurable(options?: esbuildSvelteOptions): Plugin;

export default configurable;