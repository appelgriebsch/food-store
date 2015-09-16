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
            src: ['dist/', '*~', '.*~', 'src/**/*~', 'src/**/.*~']
        }
    },
   
    concat: {
	libs: {
	   src: ['src/libs/jsqrcode/src/grid.js', 'src/libs/jsqrcode/src/version.js', 'src/libs/jsqrcode/src/detector.js',
 	         'src/libs/jsqrcode/src/formatinf.js', 'src/libs/jsqrcode/src/errorlevel.js', 'src/libs/jsqrcode/src/bitmat.js',
		 'src/libs/jsqrcode/src/datablock.js', 'src/libs/jsqrcode/src/bmparser.js', 'src/libs/jsqrcode/src/datamask.js',
		 'src/libs/jsqrcode/src/rsdecoder.js', 'src/libs/jsqrcode/src/gf256poly.js', 'src/libs/jsqrcode/src/gf256.js',
		 'src/libs/jsqrcode/src/decoder.js', 'src/libs/jsqrcode/src/qrcode.js', 'src/libs/jsqrcode/src/findpat.js',
		 'src/libs/jsqrcode/src/alignpat.js', 'src/libs/jsqrcode/src/databr.js'],
           dest: 'src/libs/jsqrcode/jsqrcode.js'
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
                { expand: true, flatten: true, src: ['src/img/*'], dest: 'dist/img/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['src/js/require.min.js'], dest: 'dist/js/', filter: 'isFile' },
                { expand: true, flatten: true, src: ['mobile.conf'], dest: 'dist/', filter: 'isFile' }
            ]
        },
        dev: {
            files: [
                { expand: true, flatten: true, src: ['src/libs/uikit/dist/fonts/*'], dest: 'src/fonts', filter: 'isFile' }
            ]
        }
    },

    less: {
        all: {
            options: {
                paths: ['src/less/'],
                compress: true,
                yuicompress: true
            },
            files: {
                'src/css/application.css': ['src/libs/csshat-lesshat/build/lesshat-prefixed.less', 'src/libs/spectrum/spectrum.css', 'src/less/*.less']
            }
        }
    },

    handlebars: {
        compile: {
            options: {
                namespace: 'Handlebars.templates',
                amd: true,
                processName: function(filePath) { // input:  templates/index.hbs
                    var pieces = filePath.split("/");
                    return pieces[pieces.length - 1].replace('.hbs', ''); // output: index
                },
                partialRegex: /.*/,
                partialsPathRegex: /\/templates\/\/partials\//,
                partialsUseNamespace: true,
                processPartialName: function(filePath) { // input:  templates/partials/_header.hbs
                    var pieces = filePath.split("/");
                    return pieces[pieces.length - 1].replace('.hbs', ''); // output: _header
                }
            },
            files: {
                'src/js/templates/handlebars.js': ['src/templates/**/*.hbs']
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
          port: 3100,
          base : "src/"
        }
      },
      production: {
        options: {
            hostname: "*",
            port: 3100,
            base: "dist/",
            keepalive: true
        }
      }
    },

    watch: {
      less: {
        files: ['src/less/*.less'],
        tasks: ['less']
      },
      handlebars: {
          files: ['src/templates/*.hbs'],
          tasks: ['handlebars']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bower-requirejs');
  grunt.loadNpmTasks('grunt-notify');

  grunt.registerTask('compile', ['concat:libs', 'bower', 'less', 'handlebars', 'copy:dev', 'notify:compiled']);
  grunt.registerTask('build', ['clean', 'concat:libs', 'bower', 'less', 'handlebars', 'copy', 'requirejs']);
  grunt.registerTask('default', ['compile', 'connect:development', 'watch']);
};
