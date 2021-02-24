/*
TODO
THIS IS A TERRIBLE WAY OF TESTING THINGS, I'M SORRY!
It doesn't even test that much :(
Perhaps at some point I will come back and fix this but for now it serves as a simple smoke test

If you really care, you are welcome to create a PR to actually test it!

TODO https://github.com/lukeed/uvu
*/
const esbuild = require("esbuild");
const sveltePlugin = require("../dist/index");

let build = {};
//should have no errors or warnings
build.onLoad = async function onLoad(selection, processor) {
    //ignore the css loader for now
    if (selection.filter.test("test.esbuild-svelte-fake-css")) {
        return;
    }

    let failed = false;
    let out = await processor({ path: require.resolve("../example/index.svelte") });

    if (out && out.warnings && out.warnings.length != 0) {
        console.error(out.warnings);
        failed = true;
    }
    if (out && out.errors && out.errors.length != 0) {
        console.error(out.errors)
        failed = true;
    }
    if (out.contents.length < 5) {
        console.error("Not the expected length")
        failed = true;
    }

    if (failed) {
        console.error("Test 1 failed");
        process.exit(1);
    } else {
        console.log("Test 1 passed");
    }
};

build.onResolve =  async function(selection, processor){
    
}
sveltePlugin().setup(build);



//Try a simple esbuild build
esbuild.build({
    entryPoints: ['./example/entry.js'],
    outdir: '../example/dist',
    format: "esm",
    minify: true,
    bundle: true,
    splitting: true,
    write: false, //Don't write anywhere
    plugins: [sveltePlugin(),]
}).catch((err) => {
    console.error("Test 2 Failed")
    console.error(err)
    process.exit(1)
}).then(() => console.log("Test 2 Passed"))


//more advanced
esbuild.build({
    entryPoints: ['./example/entry.js'],
    outdir: '../example/dist',
    format: "esm",
    minify: true,
    bundle: true,
    splitting: true,
    write: false, //Don't write anywhere
    plugins: [sveltePlugin({ compileOptions: { dev: true } }),]
}).catch((err) => {
    console.error("Test 3 Failed")
    console.error(err)
    process.exit(1)
}).then(() => console.log("Test 3 Passed"))
