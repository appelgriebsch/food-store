var fs = require('fs');

module.exports = function(grunt) {

  grunt.initConfig({

    notify: {
        compiled: {
            options: {
                message: 'Compilation succeeded!'
            }
        }
    },

    bower: {
        target: {
            rjsConfig: 'src/js/init.js'
        }
    },

    clean: {
        build: {
            src: ['dist/']
        }
    },

    copy: {
        main: {
            files: [
                { expand: true, flatten: true, src: ['src/*.html', 'src/*.json'], dest: 'dist/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['src/manifest.*'], dest: 'dist/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['src/libs/uikit/dist/fonts/*'], dest: 'dist/fonts', filter: 'isFile' },
                { expand: true, flatten: true, src: ['src/js/templates/**/*.js'], dest: 'dist/js/templates', filter: 'isFile' },
                { expand: true, flatten: true, src: ['src/css/application.css'], dest: 'dist/css/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['src/fonts/**/*'], dest: 'dist/fonts/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['cskiosk.conf'], dest: 'dist/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['src/images/**/*'], dest: 'dist/images/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['src/js/jquery.min.js'], dest: 'dist/js/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['src/js/require.min.js'], dest: 'dist/js/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['src/videos/**/*'], dest: 'dist/videos/', filter: 'isFile' }
            ]
        }
    },

    stylus: {
        all: {
            options: {
                paths: ['src/stylus/', 'src/libs/nib/'],
                compress: true
            },
            files: {
                'src/css/application.css': ['src/stylus/application.styl']
            }
        }
    },

    requirejs: {
        compile: {
            options: {
                baseUrl: 'src/js/',
                mainConfigFile: 'src/js/init.js',
                optimize: 'uglify2',
                name: "init",
                out: "dist/js/init.js"
            }
        }
    },

    connect: {
      development: {
        options: {
          hostname: "*",
          port: 3030,
          base : "src/"
        }
      },
      production: {
        options: {
          hostname: "*",
          port: 3030,
          base: "dist/",
          keepalive: true
        }
      }
    },

    watch: {
      stylus: {
        files: ['src/stylus/*.styl'],
        tasks: ['stylus', 'notify:compiled'],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-bower-requirejs');
  grunt.loadNpmTasks('grunt-notify');

  grunt.registerTask('compile', ['bower', 'stylus', 'notify:compiled']);
  grunt.registerTask('build', ['clean', 'bower', 'stylus', 'copy', 'requirejs']);
  grunt.registerTask('default', ['compile', 'connect:development', 'watch']);
};
