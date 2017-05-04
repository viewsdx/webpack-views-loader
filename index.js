const { getOptions } = require('loader-utils')
const { getViewNotFound, morph, pathToName, types } = require('views-morph')
const { relative } = require('path')
const globule = require('globule')
const toPascalCase = require('to-pascal-case')
const watch = require('gaze')

const { ACTION, TELEPORT } = types

let views = false
function setup(src, map = {}) {
  views = map

  const addView = f => {
    const { file, view } = toViewPath(f)
    views[view] = file
  }

  const toViewPath = f => {
    const file = relative(src, f)
    const view = toPascalCase(file.replace(/\.(view|js)/g, ''))

    return {
      file: `./${file}`,
      view,
    }
  }

  const watcherOptions = { filter: f => !/node_modules/.test(f) }
  const watcherPattern = ['**/*.js', '**/*.view']
  globule.find(watcherPattern, watcherOptions).forEach(addView)

  watch(watcherPattern, watcherOptions, (err, watcher) => {
    if (err) {
      console.error(err)
      return
    }

    // TODO see how we can force a rebuild when a file gets added/deleted
    watcher.on('added', addView)
    watcher.on('deleted', f => {
      const { view } = toViewPath(f)
      delete views[view]
    })
  })
}

module.exports = function viewsLoader(source) {
  let { as, compile, map, shared, src, viewNotFound } = Object.assign(
    {
      as: 'react-dom',
      compile: true,
      src: `${process.cwd()}/src`,
    },
    getOptions(this)
  )

  if (!shared) shared = `views-blocks-${as}`
  if (!viewNotFound)
    viewNotFound = name => {
      const warning = `${src}/${name}.view doesn't exist but it is being used. Create the file!`
      this.emitWarning(new Error(warning))
      return getViewNotFound(as, name, warning)
    }

  if (!views) setup(src, map)

  const getImport = name => {
    switch (name) {
      case ACTION:
      case TELEPORT:
        return `import { ${name} } from '${shared}'`
      default:
        return views[name]
          ? `import ${name} from '${views[name]}'`
          : viewNotFound(name)
    }
  }

  return morph(source, {
    as,
    compile,
    name: pathToName(this.resourcePath),
    getImport,
  })
}
