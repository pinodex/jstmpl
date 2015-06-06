var banner = [
    '/*! <%= pkg.name %> <%= pkg.version %> ',
    'Built: <%= grunt.template.today("isoDateTime") %> | ',
    'Copyright (c) 2015 Raphael Marco */\n'
].join('');

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['default'],
                options: {
                    spawn: false,
                },
            },
        },
        concat: {
            options: {
                stripBanners: true,
                separator: '\n\n',
                banner: banner + '\n(function(){\n\n\t"use strict";\n\n',
                footer: '\n\n}());',
                process: function(src, filepath) {
                    return src.replace(/(.+)/g, '    $1');
                }
            },
            dist: {
                src: 'src/**/*.js',
                dest: 'dist/<%= pkg.name %>.js',
            },
        },
        uglify: {
            options: {
                banner: banner
            },
            build: {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', [
        'concat',
        'uglify'
    ]);
};