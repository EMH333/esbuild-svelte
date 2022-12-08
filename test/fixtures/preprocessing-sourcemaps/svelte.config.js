const { typescript } = require("svelte-preprocess-esbuild");
const { sass } = require("svelte-preprocess-sass");

module.exports = {
    preprocess: [{ style: sass() }, typescript()],
};
