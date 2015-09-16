var fs = require('fs');

module.exports = function (grunt) {

    grunt.initConfig({

        notify: {
            compiled: {
                options: {
                    message: 'Compilation succeeded!'
                }
            }
        },

        clean: {
            build: {
                src: ['dist/', '*~', '.*~', 'src/**/*~', 'src/**/.*~']
            }
        },

        copy: {
            main: {
                files: [
                    { expand: true, cwd: 'src/', src: ['*.js'], dest: 'dist/', filter: 'isFile' },
                    { expand: true, cwd: 'src/', src: ['**'], dest: 'dist/', filter: 'isFile' }
                ]
            },
            build: {
                files: [
                    { expand: true, cwd: 'src/', src: ['*.js'], dest: 'dist/', filter: 'isFile' },
                    { expand: true, cwd: 'src/', src: ['**'], dest: 'dist/', filter: 'isFile' },
		    { expand: true, src: ['package.json'], dest: 'dist/', filter: 'isFile' },
		    { expand: true, src: ['server.conf'], dest: 'dist/', filter: 'isFile' },
                    { expand: true, cwd: 'node_modules/', src: ['**'], dest: 'dist/node_modules', filter: 'isFile' },
                ]
            }
        },

        watch: {
            scripts: {
                files: ['src/*.html', 'src/manifest.*', '!node_modules/**/*.js', '!src/libs/**/*.js', 'src/**/*.js', 'src/views/**/*.hbs', 'src/less/*.less'],
                tasks: ['compile']
            }
        },

        nodemon: {
            dev: {
                options: {
                    file: 'src/app.js',
                    nodeArgs: ['--debug'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['src'],
                    delayTime: 1,
                    legacyWatch: true,
                    env: {
                        NODE_ENV: 'development',
                        PORT: 3000
                    }
                }
            }
        },

        'node-inspector': {
            custom: {
                options: {
                    'web-port': 1337,
                    'web-host': 'localhost',
                    'save-live-edit': true,
                    'stack-trace-limit': 4
                }
            }
        },

        concurrent: {
            dev: {
                tasks: ['nodemon', 'node-inspector', 'notify'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-node-inspector');
    grunt.loadNpmTasks('grunt-notify');

    grunt.registerTask('compile', ['copy']);
    grunt.registerTask('build', ['clean', 'copy:build']);
    grunt.registerTask('default', ["clean", "compile", "concurrent"]);
};
