import { dirname } from "path";
import { pathToFileURL, fileURLToPath } from "url";
import * as sassCompiler from "sass";

export function sass() {
    return function ({ filename, content, attributes }) {
        if (
            !(
                attributes.type?.includes("text/scss") ||
                attributes.lang?.includes("scss") ||
                attributes.type?.includes("text/sass") ||
                attributes.lang?.includes("sass")
            )
        ) {
            return null;
        }
        const { css, sourceMap, loadedUrls } = sassCompiler.compileString(content, {
            url: pathToFileURL(filename),
            loadPaths: [dirname(filename)],
        });
        return {
            code: css.toString(),
            sourceMap,
            dependencies: loadedUrls.map((url) => fileURLToPath(url)),
        };
    };
}
