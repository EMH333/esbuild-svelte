import { Plugin } from 'esbuild';
import { CompileOptions } from 'svelte/types/compiler/interfaces';

interface esbuildSvelteOptions {
    compileOptions: CompileOptions
}

declare function configurable(options?:esbuildSvelteOptions): Plugin;

export default configurable;