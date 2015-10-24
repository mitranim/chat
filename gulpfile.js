'use strict'

/**
 * Requires gulp 4.0: https://github.com/gulpjs/gulp/tree/4.0
 *
 * Style per http://standardjs.com
 */

/* ***************************** Dependencies ********************************/

const $ = require('gulp-load-plugins')()
const bsync = require('browser-sync').create()
const del = require('del')
const flags = require('yargs').boolean('prod').argv
const gulp = require('gulp')
const pt = require('path')
const webpack = require('webpack')

/* ******************************** Globals **********************************/

const src = {
  html: 'src/html/**/*',
  scripts: 'src/scripts/**/*.js',
  scriptsCore: 'src/scripts/app.js',
  stylesCore: 'src/styles/app.scss',
  styles: 'src/styles/**/*.scss',
  fonts: 'node_modules/font-awesome/fonts/**/*'
}

const dest = {
  html: 'dist',
  styles: 'dist/styles',
  scripts: 'dist/scripts',
  fonts: 'dist/fonts'
}

function reload (done) {
  bsync.reload()
  done()
}

/* ********************************* Tasks ***********************************/

/* -------------------------------- Scripts ---------------------------------*/

function scripts (done) {
  const alias = {
    /* ... */
  }
  if (flags.prod) {
    alias['react'] = 'react/dist/react.min'
    alias['react-dom'] = 'react-dom/dist/react-dom.min'
  }

  webpack({
    entry: './' + src.scriptsCore,
    output: {
      path: pt.join(process.cwd(), dest.scripts),
      filename: 'app.js'
    },
    resolve: {
      alias: alias
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel',
          query: {
            modules: 'common',
            optional: [
              'spec.protoToAssign',
              'es7.classProperties',
              'es7.decorators',
              'es7.functionBind',
              'es7.objectRestSpread',
              'validation.undeclaredVariableCheck'
            ],
            loose: [
              'es6.classes',
              'es6.properties.computed',
              'es6.forOf'
            ]
          }
        }
      ]
    },
    plugins: flags.prod ? [new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}})] : [],
    // devtool: !flags.prod && typeof done !== 'function' ? 'inline-source-map' : null,
    watch: typeof done !== 'function'
  }, function (err, stats) {
    if (err) {
      throw new Error(err)
    } else {
      const report = stats.toString({
        colors: true,
        chunks: false,
        timings: true,
        version: false,
        hash: false,
        assets: false
      })
      if (report) console.log(report)
    }
    if (typeof done === 'function') done()
    else bsync.reload()
  })
}

gulp.task('scripts:build', scripts)

gulp.task('scripts:build:watch', (_) => {scripts()})

/* -------------------------------- Styles ----------------------------------*/

gulp.task('styles:clear', function (done) {
  del(dest.styles).then((_) => {done()})
})

gulp.task('styles:compile', function () {
  return gulp.src(src.stylesCore)
    .pipe($.plumber())
    .pipe($.sass())
    .pipe($.autoprefixer())
    .pipe($.if(flags.prod, $.minifyCss({
      keepSpecialComments: 0,
      aggressiveMerging: false,
      advanced: false
    })))
    .pipe(gulp.dest(dest.styles))
    .pipe(bsync.stream())
})

gulp.task('styles:build',
  gulp.series('styles:clear', 'styles:compile'))

gulp.task('styles:watch', function () {
  $.watch(src.styles, gulp.series('styles:build'))
})

/* --------------------------------- HTML -----------------------------------*/

gulp.task('html:clear', function (done) {
  del(dest.html + '/**/*.html').then((_) => {done()})
})

gulp.task('html:compile', function () {

  return gulp.src(src.html)
    .pipe($.plumber())
    .pipe($.statil({imports: {prod: flags.prod}}))
    // Change each `<filename>` into `<filename>/index.html`.
    .pipe($.rename(function (path) {
      switch (path.basename + path.extname) {
        case 'index.html': case '404.html': return
      }
      path.dirname = pt.join(path.dirname, path.basename)
      path.basename = 'index'
    }))
    .pipe($.if(flags.prod, $.minifyHtml({
      empty: true
    })))
    .pipe(gulp.dest(dest.html))
})

gulp.task('html:build', gulp.series('html:clear', 'html:compile'))

gulp.task('html:watch', function () {
  $.watch(src.html, gulp.series('html:build', reload))
})

/* --------------------------------- Fonts ----------------------------------*/

gulp.task('fonts:clear', function (done) {
  del(dest.fonts).then((_) => {done()})
})

gulp.task('fonts:copy', function () {
  return gulp.src(src.fonts).pipe(gulp.dest(dest.fonts))
})

gulp.task('fonts:build', gulp.series('fonts:copy'))

gulp.task('fonts:watch', function () {
  $.watch(src.fonts, gulp.series('fonts:build', reload))
})

/* -------------------------------- Server ----------------------------------*/

gulp.task('server', function () {
  return bsync.init({
    startPath: '/chat/',
    server: {
      baseDir: dest.html,
      middleware: function (req, res, next) {
        req.url = req.url.replace(/^\/chat/, '/')
        next()
      }
    },
    port: 3874,
    online: false,
    ui: false,
    files: false,
    ghostMode: false,
    notify: false
  })
})

/* -------------------------------- Default ---------------------------------*/

if (flags.prod) {
  gulp.task('build', gulp.parallel(
    'scripts:build', 'styles:build', 'html:build', 'fonts:build'
  ))
} else {
  gulp.task('build', gulp.parallel(
    'styles:build', 'html:build', 'fonts:build'
  ))
}

gulp.task('watch', gulp.parallel(
  'scripts:build:watch', 'styles:watch', 'html:watch', 'fonts:watch'
))

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'server')))
