#!/usr/bin/env node
const { readFile, writeFile } = require('fs');
const { promisify } = require('util');
const esbuild = require('esbuild');
const ts = require('typescript');
const imports = require('rewrite-imports');

const read = promisify(readFile);
const write = promisify(writeFile);

const esbuildCommon = {
    entryPoints: ['./index.ts'],
    platform: 'node',
    target: ['node12.20.1']
};


(async function () {
    await esbuild.build({
        format: 'esm',
        outfile: './dist/index.mjs',
        ...esbuildCommon
    })

    //doesn't do default exports well
    /*esbuild.build({
        format: "cjs",
        outfile: "./dist/index.js",
        ...esbuildCommon
    }).catch((err) => {
        console.error(err)
        process.exit(1)
    })*/

    let output = await read('./dist/index.mjs', 'utf8');
    await write('./dist/index.js', imports(output)
        .replace(/export {.*sveltePlugin as default.*};/s,
            'module.exports = sveltePlugin;'));

    const program = ts.createProgram(['index.ts'], {
        declaration: true,
        emitDeclarationOnly: true,
        outDir: './dist'
    });
    program.emit();

})().catch(err => {
    console.error('ERROR', err.stack || err);
    process.exit(1);
});
