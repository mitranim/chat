'use strict'

const bs = require('browser-sync').create()
const {log} = require('gulp-util')
const mapValues = require('lodash/mapValues')

const prod = process.env.NODE_ENV === 'production'

const config = require('./webpack.config')

if (prod) {
  require('webpack')(config).watch({}, (err, stats) => {
    log('[webpack]', stats.toString(config.stats))
    if (err) log('[webpack]', err.message)
  })
}

const compiler = prod ? null : require('webpack')(extend(config, {
  entry: mapValues(config.entry, fsPath => (
    ['webpack-hot-middleware/client', fsPath]
  )),
}))

const proxy = require('http-proxy').createProxyServer()

proxy.on('error', err => {
  console.error(err)
})

bs.init({
  startPath: '/chat/',
  server: {
    baseDir: 'dist',
    middleware: [
      (req, res, next) => {
        req.url = req.url.replace(/^\/chat\//, '').replace(/^[/]*/, '/')
        next()
      },
      ...(prod ? [] : [
        require('webpack-dev-middleware')(compiler, {
          publicPath: config.output.publicPath,
          stats: config.stats,
        }),
        require('webpack-hot-middleware')(compiler),
      ]),
      require('connect-history-api-fallback')(),
    ],
  },
  port: 3874,
  files: 'dist',
  open: false,
  online: false,
  ui: false,
  ghostMode: false,
  notify: false,
})

function extend () {
  return Object.assign({}, ...arguments)
}
