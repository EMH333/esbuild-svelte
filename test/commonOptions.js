module.exports = {
    format: "esm",
    minify: true,
    bundle: true,
    splitting: true,
    write: false, //Don't write anywhere
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
};
