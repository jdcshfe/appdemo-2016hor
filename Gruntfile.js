/*global module */

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    browserSync: {
      dev: {
        bsFiles: {
          src: [
            'www/**/*.{css,html}',
            'www/js/*.js'
          ]
        },
        options: {
          startPath: "www/index.html",
          server: {
            baseDir: "./"
          }
        }
      }
    }
  });

  //load
  grunt.loadNpmTasks('grunt-browser-sync');
  //task
  grunt.registerTask('default', ['browserSync']);
};