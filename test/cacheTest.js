const esbuild = require("esbuild");
const sveltePlugin = require("../dist/index");

//with cache enabled
esbuild.build({
    entryPoints: ['./example/entry.js'],
    outdir: '../example/dist',
    format: "esm",
    minify: true,
    bundle: true,
    splitting: true,
    write: false, //Don't write anywhere
    plugins: [sveltePlugin({ cache: true }),]
}).catch((err) => {
    console.error("Cache Test 1 Failed")
    console.error(err)
    process.exit(1)
}).then(() => console.log("Cache Test 1 Passed"))

async function incrementalTest() {
    let result = await esbuild.build({
        entryPoints: ['./example/entry.js'],
        outdir: '../example/dist',
        format: "esm",
        minify: true,
        bundle: true,
        splitting: true,
        write: false, //Don't write anywhere
        plugins: [sveltePlugin({ cache: true }),],
        incremental: true
    })

    // Call "rebuild" as many times as you want
    for (let i = 0; i < 5; i++) {
        await result.rebuild();
    }

    // Call "dispose" when you're done to free up resources.
    result.rebuild.dispose()

    console.log("Cache Test 2 Passed")
}

incrementalTest();
