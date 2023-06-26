const fs = require("fs");
const esbuild = require("esbuild");
const sveltePlugin = require("./index");

const esbuildVersion = process.argv[2];
const svelteVersion = process.argv[3];

//make sure the directoy exists before stuff gets put into it
if (!fs.existsSync("./dist/")) {
    fs.mkdirSync("./dist/");
}

//build the application
esbuild
    .build({
        entryPoints: ["./entry.js"],
        mainFields: ["svelte", "browser", "module", "main"],
        conditions: ["svelte", "browser"],
        target: "es2016",
        outdir: "./dist",
        format: "esm",
        logLevel: "info",
        minify: false, //so the resulting code is easier to understand
        bundle: true,
        splitting: true,
        sourcemap: "inline",
        plugins: [sveltePlugin()],
    })
    .then((results) => {
        if (results.warnings.length > 0) {
            console.error(
                "Build had warnings with esbuild version " +
                    esbuildVersion +
                    " and svelte version " +
                    svelteVersion
            );
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error(err);
        console.error(
            "Build failed with esbuild version " +
                esbuildVersion +
                " and svelte version " +
                svelteVersion
        );
        process.exit(1);
    });
