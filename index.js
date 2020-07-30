let svelte = require('svelte/compiler')
let path = require('path')
let util = require('util')
let fs = require('fs')

let sveltePlugin = plugin => {
  plugin.setName('svelte');
  plugin.addLoader({ filter: /\.svelte$/ }, async (args) => {
    let convertMessage = ({ message, start, end }) => ({
      text: message,
      location: start && end && {
        file: filename,
        line: start.line,
        column: start.column,
        length: start.line === end.line ? end.column - start.column : 0,
        lineText: source.split(/\r\n|\r|\n/g)[start.line - 1],
      },
    })
    let source = await util.promisify(fs.readFile)(args.path, 'utf8')
    let filename = path.relative(process.cwd(), args.path)
    try {
      let { js, warnings } = svelte.compile(source, { filename })
      let contents = js.code + `//# sourceMappingURL=` + js.map.toUrl()
      return { contents, warnings: warnings.map(convertMessage) }
    } catch (e) {
      return { errors: [convertMessage(e)] }
    }
  })
}