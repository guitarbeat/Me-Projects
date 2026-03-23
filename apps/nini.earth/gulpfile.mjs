/**
 * @fileoverview Gulp Build Configuration for Kanye 2049 Tribute
 * 
 * This file configures the build process for the Kanye 2049 tribute website.
 * It handles SCSS compilation, JavaScript minification, asset optimization,
 * and development server setup with live reload.
 * 
 * @author Aaron Woods
 * @version 1.0.0
 * @license ISC
 */

// Importing required modules using ESM syntax
import gulp from 'gulp';
import * as sassModule from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(sassModule);
import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
// import imagemin from 'gulp-imagemin';
import browserSyncModule from 'browser-sync';
const browserSync = browserSyncModule.create();

/**
 * File path configurations
 * Defines source and destination paths for all build tasks
 * @type {Object}
 */
const paths = {
  /** SCSS/CSS processing paths */
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'dist/css'
  },
  /** JavaScript processing paths */
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js'
  },
  /** Image processing paths */
  images: {
    src: 'src/img/**/*',
    dest: 'dist/img'
  },
  /** HTML file paths */
  html: {
    src: 'src/**/*.html',
    dest: 'dist/'
  },
  /** Favicon and web app manifest paths */
  favicons: {
    src: [
      'src/*.ico',
      'src/*.webmanifest',
      'src/*.xml',
      'src/apple-touch-icon.png',
      'src/favicon-16x16.png', // Explicitly including favicon sizes
      'src/favicon-32x32.png'
    ],
    dest: 'dist/'
  },
  /** Static asset paths */
  static: {
    bootstrap: 'src/bootstrap/**/*',
    humans: 'src/humans.txt',
    fonts: 'src/fonts/**/*',
    sound: 'src/sound/**/*',
    video: 'src/video/**/*'
  }
};

/**
 * SCSS compilation task
 * Compiles SCSS files to CSS, minifies them, and adds .min suffix
 * @returns {Stream} Gulp stream for SCSS processing
 */
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

/**
 * JavaScript minification task
 * Minifies JavaScript files for production
 * @returns {Stream} Gulp stream for JavaScript processing
 */
function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(uglify())
    // .pipe(rename({
    //   suffix: '.min'
    // }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

/**
 * Image optimization task
 * Copies images to dist folder (optimization disabled for now)
 * @returns {Stream} Gulp stream for image processing
 */
function images() {
  return gulp.src(paths.images.src)
    // .pipe(imagemin()) // Image optimization disabled
    .pipe(gulp.dest(paths.images.dest));
}

/**
 * HTML file copying task
 * Copies HTML files to dist folder
 * @returns {Stream} Gulp stream for HTML processing
 */
function html() {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

/**
 * Favicons and web app assets task
 * Copies favicon files and web app manifest to dist folder
 * @returns {Stream} Gulp stream for favicon processing
 */
function favicons() {
  return gulp.src(paths.favicons.src)
    .pipe(gulp.dest(paths.favicons.dest));
}

/**
 * Static files copying task
 * Copies various static assets (Bootstrap, fonts, sounds, videos) to dist folder
 * @returns {Stream} Gulp stream for static file processing
 */
function staticFiles() {
  // Copy Bootstrap assets
  gulp.src(paths.static.bootstrap)
    .pipe(gulp.dest('dist/bootstrap'));
  // Copy humans.txt file
  gulp.src(paths.static.humans)
    .pipe(gulp.dest('dist'));
  // Copy font files
  gulp.src(paths.static.fonts)
    .pipe(gulp.dest('dist/fonts'));
  // Copy sound files
  gulp.src(paths.static.sound)
    .pipe(gulp.dest('dist/sound'));
  // Copy video files
  return gulp.src(paths.static.video)
    .pipe(gulp.dest('dist/video'));
}

/**
 * Watch task for development
 * Sets up file watching and BrowserSync development server
 * Watches for changes in SCSS, JS, images, HTML, and favicon files
 */
function watch() {
  // Initialize BrowserSync development server
  browserSync.init({
    server: {
      baseDir: './dist' // Serve files from dist directory
    },
    open: false // Prevent Browsersync from automatically opening a browser window
  });
  
  // Watch SCSS files and trigger styles task
  gulp.watch(paths.styles.src, styles);
  // Watch JavaScript files and trigger scripts task
  gulp.watch(paths.scripts.src, scripts);
  // Watch image files and trigger images task
  gulp.watch(paths.images.src, images);
  // Watch HTML files and trigger full page reload
  gulp.watch(paths.html.src, html).on('change', browserSync.reload);
  // Watch favicon files and trigger full page reload
  gulp.watch(paths.favicons.src, favicons).on('change', browserSync.reload);
}

/**
 * Build and dev tasks
 * - build: runs all tasks once
 * - default (dev): build then watch with BrowserSync
 */
export const build = gulp.parallel(styles, scripts, images, html, favicons, staticFiles);
export const dev = gulp.series(build, watch);
export default dev;
