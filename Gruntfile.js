/*global module */

module.exports = function(grunt) {
  'use strict';

  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    //watch
    watch: {
      sass: {
        files: ['www/css/*.scss'],
        tasks: ['sass']
      }
    },
    browserSync: {
      dev: {
        bsFiles: {
          src: [
            'www/**/*.{css,html}',
            'www/js/*.js'
          ]
        },
        options: {
          server: {
            baseDir: "./"
          },
          startPath: "www/index.html",
          watchTask: true // < VERY important
        }
      }
    },

    //sass
    sass: {
      dist: {
        options: {
          outputStyle: 'compressed',
          sourceMap: true,
          includePaths: [
              'bower_components/bourbon/app/assets/stylesheets/'
            ]
        },
        files: [{
          expand: true,
          cwd: 'www/css',
          src: ['{,*/}*.scss'],
          dest: 'www/css',
          ext: '.css'
        }]
      }
    }
  });

  //task
  grunt.registerTask('default', [
    'browserSync',
    'watch'
    ]);
};