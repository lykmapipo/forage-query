'use strict';

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the module
    var props = {
        src: 'src',
        dist: 'dist',
        test: 'test',
        spec: 'test/spec',
        tmp: '.tmp'
    };

    // Project propsuration.
    grunt
        .initConfig({
            pkg: grunt.file.readJSON('bower.json'),
            props: props,
            meta: {
                banner: [
                    '/**',
                    ' * <%= pkg.description %>',
                    ' * @version v<%= pkg.version %> - <%= grunt.template.today() %>',
                    ' * @link <%= pkg.homepage %>',
                    ' * @authors <%= pkg.authors.join(", ") %>',
                    ' * @license MIT License, http://www.opensource.org/licenses/MIT',
                    ' */',
                    ''
                ].join('\n')
            },

            //clean environments
            clean: {
                dist: {
                    files: [{
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= props.dist %>'
                        ]
                    }]
                }
            },

            // Make sure code styles are up to par 
            // and there are no obvious mistakes
            jshint: {
                options: {
                    jshintrc: '.jshintrc',
                    reporter: require('jshint-stylish')
                },
                src: {
                    src: [
                        'Gruntfile.js',
                        '<%= props.src %>/**/*.js'
                    ]
                },
                test: {
                    options: {
                        jshintrc: '<%= props.test %>/.jshintrc'
                    },
                    src: ['<%= props.spec %>/**/*.js']
                }
            },

            //watch environment
            watch: {
                bower: {
                    files: ['bower.json'],
                    tasks: ['newer:jshint:src', 'newer:jshint:test', 'karma']
                },
                src: {
                    files: ['<%= props.src %>/**/*.js'],
                    tasks: ['newer:jshint:src', 'karma'],
                },
                test: {
                    files: ['<%= props.test %>/karma.conf.js', '<%= props.spec %>/**/*.js'],
                    tasks: ['newer:jshint:test', 'karma']
                },
                gruntfile: {
                    files: ['Gruntfile.js'],
                    tasks: ['newer:jshint:src', 'newer:jshint:test', 'karma']
                }
            },

            //concat task
            concat: {
                dist: {
                    options: {
                        banner: '<%= meta.banner %>\n',
                        stripBanners: true,
                        separator: '\n\n'
                    },
                    files: {
                        'dist/<%= pkg.name %>.js': [
                            'bower_components/mingo/mingo.js',
                            '<%= props.src %>/query.js',
                            '<%= props.src %>/aggregators/**/*.js',
                            '<%= props.src %>/creators/**/*.js',
                            '<%= props.src %>/finders/**/*.js',
                            '<%= props.src %>/removers/**/*.js',
                            '<%= props.src %>/sorters/**/*.js',
                            '<%= props.src %>/updators/**/*.js'
                        ]
                    }
                }
            },

            // Automatically inject Bower components into the app
            wiredep: {
                test: {
                    devDependencies: true,
                    src: '<%= karma.unit.configFile %>',
                    ignorePath: /\.\.\//,
                    fileTypes: {
                        js: {
                            block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
                            detect: {
                                js: /'(.*\.js)'/gi
                            },
                            replace: {
                                js: '\'{{filePath}}\','
                            }
                        }
                    }
                }
            },

            //karma task configuration
            karma: {
                unit: {
                    configFile: '<%= props.test %>/karma.conf.js',
                    singleRun: true
                }
            },

            //replace configurations
            replace: {
                dist: {
                    options: {
                        usePrefix: false,
                        patterns: [{
                            match: 'require("underscore")',
                            replacement: function() {
                                return 'require("lodash")';
                            }
                        }]
                    },
                    files: [{
                        src: [
                            '<%= props.dist%>/<%= pkg.name %>.js'
                        ],
                        dest: '<%= props.dist%>/<%= pkg.name %>.js'
                    }]
                }
            },

            //umd configuration
            umd: {
                dist: {
                    options: {
                        src: '<%= props.dist%>/<%= pkg.name %>.js',
                        dest: '<%= props.dist%>/<%= pkg.name %>.js',
                        // objectToExport: 'forageQuery', // optional, internal object that will be exported
                        // amdModuleId: 'forageQuery', // optional, if missing the AMD module will be anonymous
                        // globalAlias: 'forageQuery', // optional, changes the name of the global variable
                        deps: {
                            'default': ['localforage', '_', 'uuid'],
                            amd: [
                                'localforage',
                                'lodash',
                                'node-uuid',
                            ],
                            cjs: [
                                'localforage',
                                'lodash',
                                'node-uuid'
                            ]
                        }
                    }
                }
            }
        });

    //custom tasks
    grunt.registerTask('default', ['watch']);

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
        'karma',
        'concat',
        'replace:dist',
        'umd:dist'
    ]);

    grunt.registerTask('test', [
        'wiredep',
        'jshint',
        'karma'
    ]);

};