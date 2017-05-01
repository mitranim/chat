'use strict'

/**
 * Dependencies
 */

const $ = require('gulp-load-plugins')()
const del = require('del')
const gulp = require('gulp')
const {obj: passthrough} = require('through2')
const pt = require('path')
const webpack = require('webpack')
const {execSync, fork} = require('child_process')

const webpackConfig = require('./webpack.config')

/**
 * Globals
 */

const src = {
  root: 'src',
  static: 'src/static/**/*',
  staticFonts: 'node_modules/font-awesome/fonts/**/*',
  staticFontsBase: 'node_modules/font-awesome',
  html: 'src/html/**/*',
  scripts: 'src/scripts/**/*.js',
  styleGlobs: ['src/styles/**/*.scss'],
  styleEntryFiles: ['src/styles/main.scss'],
  imagesRaster: ['src/images/**/*.{jpg,png,gif}'],
  imagesVector: ['src/images/**/*.svg'],
}

const out = {
  root: 'dist',
  scripts: 'dist/scripts',
  styles: 'dist/styles',
  images: 'dist/images',
}

const prod = process.env.NODE_ENV === 'production'

const deploySettings = {
  analytics: prod,
  devMode: !prod,
  errorTracking: prod,
}

const autoprefixerSettings = {browsers: ['> 1%', 'IE >= 9', 'iOS 7']}

const cssCleanSettings = {
  keepSpecialComments: 0,
  aggressiveMerging: false,
  advanced: false,
  // Don't inline `@import: url()`
  processImport: false,
}

const versionCmd = 'git rev-parse --short HEAD'

const Err = (key, msg) => new $.util.PluginError(key, msg, {showProperties: false})

/**
 * Clear
 */

gulp.task('clear', () => (
  del(out.root).catch(console.error.bind(console))
))

/**
 * Static
 */

gulp.task('static:copy', () => (
  gulp.src(src.static)
    .pipe(gulp.src(src.staticFonts, {base: src.staticFontsBase, passthrough: true}))
    .pipe(gulp.dest(out.root))
))

gulp.task('static:watch', () => {
  $.watch([src.static, src.staticFonts], gulp.series('static:copy'))
})

/**
 * HTML
 */

gulp.task('html:build', () => {
  const version = execSync(versionCmd).toString().replace(/\n/, '')

  return gulp.src(src.html)
    .pipe($.statil({
      imports: {prod, deploySettings, version},
      pathRename: (path, {dir, name}) => (
        path === 'index.html' || path === '404.html'
        ? path
        : pt.join(dir, name, 'index.html')
      ),
    }))
    .pipe(gulp.dest(out.root))
})

gulp.task('html:watch', () => {
  $.watch(src.html, gulp.series('html:build'))
})

/**
 * Scripts
 */

gulp.task('scripts:build', done => {
  buildWithWebpack(webpackConfig, done)
})

function buildWithWebpack (config, done) {
  return webpack(config, (err, stats) => {
    if (err) {
      done(Err('webpack', err))
    } else {
      $.util.log('[webpack]', stats.toString(config.stats))
      done(stats.hasErrors() ? Err('webpack', 'plugin error') : null)
    }
  })
}

/**
 * Styles
 */

gulp.task('styles:build', () => (
  gulp.src(src.styleEntryFiles)
    .pipe($.sass({includePaths: [src.root]}))
    .pipe($.autoprefixer(autoprefixerSettings))
    .pipe(!prod ? passthrough() : $.cleanCss(cssCleanSettings))
    .pipe(gulp.dest(out.styles))
))

gulp.task('styles:watch', () => {
  $.watch(src.styleGlobs, gulp.series('styles:build'))
})

/**
 * Images
 */

gulp.task('images:raster', () => (
  gulp.src(src.imagesRaster)
    // Requires `graphicsmagick` or `imagemagick`. Install via Homebrew.
    .pipe($.imageResize({quality: 1}))
    .pipe(gulp.dest(out.images))
))

gulp.task('images:vector', () => (
  gulp.src(src.imagesVector)
    .pipe($.svgo())
    .pipe(gulp.dest(out.images))
))

gulp.task('images:build', gulp.parallel('images:raster', 'images:vector'))

gulp.task('images:watch', () => {
  $.watch(src.imagesRaster, gulp.series('images:raster'))
  $.watch(src.imagesVector, gulp.series('images:vector'))
})

/**
 * Devserver + Scripts
 */

gulp.task('devserver', () => {
  let proc

  process.on('exit', () => {
    if (proc) proc.kill()
  })

  function restart () {
    if (proc) proc.kill()
    proc = fork('./devserver')
  }

  restart()
  $.watch(['./webpack.config.js', './devserver.js'], restart)
})

/**
 * Default
 */

gulp.task('buildup', gulp.parallel(
  'static:copy',
  'html:build',
  'styles:build',
  'images:build'
))

gulp.task('watch', gulp.parallel(
  'static:watch',
  'html:watch',
  'styles:watch',
  'images:watch',
  'devserver'
))

gulp.task('build', gulp.series('clear', gulp.parallel('buildup', 'scripts:build')))

gulp.task('default', gulp.series('clear', gulp.parallel('buildup', 'watch')))
