module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.author %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage : "" %>\n' +
            ' Licensed <%= pkg.license %> */\n\n',

    jshint: {
      files: ['Gruntfile.js', 'src/js/*.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },

    less: {
      main: {
        files: {
          'dist/css/style.css': [ 'src/less/main.less' ]
        }
      },
      min: {
        options: {
          cleancss: true,
        },
        files: {
          'dist/css/style.min.css': [ 'src/less/main.less' ]
        }
      }
    },

    bower_concat: {
      all: {
        dest: '_tmp/_bower.js',
      }
    },

    concat: {
      options: {
        stripBanners: true,
        banner: '<%= banner %>'
      },
      grid: {
        src: ['src/js/utils.js', 'src/js/grid.js', 'src/js/widget.js'],
        dest: 'dist/grid.js'
      },
      grid_and_libs: {
        src: [ '_tmp/_bower.js', 'src/js/utils.js', 'src/js/grid.js', 'src/js/widget.js'],
        dest: 'dist/grid.with.libs.js'
      },
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      grid: {
        files: {
          'dist/grid.min.js': [ '<%= concat.grid.dest %>' ],
        }
      },
      grid_and_libs: {
        files: {
          'dist/grid.with.libs.min.js': [ '<%= concat.grid_and_libs.dest %>' ],
        }
      }
    },

    clean: {
      tmp: ['_tmp'],
    },

    copy: {
      index: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: ['index.html', 'examples/*.html'],
            dest: 'dist/'
          }
        ]
      }
    },

    watch: {
      options: {
        livereload: true,
        port: 9002
      },
      less: {
        files: [ 'src/less/*.less' ],
        tasks: [ 'less' ],
      },
      js: {
        files: [ 'src/js/**/*.js', 'src/js/*.js' ],
        tasks: [ 'bower_concat', 'concat', 'clean', 'uglify' ],
      },
      html: {
        files: [ 'src/index.html', 'src/examples/*.html' ],
        tasks: [ 'copy' ]
      }
    },

    open : {
      dev : {
        path: 'http://127.0.0.1:9000'
      }
    },

    connect: {
      server: {
        options: {
          base: "./dist",
          port: 9000,
          hostname: "127.0.0.1"
        }
      }
    }

  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', [ 'jshint', 'less', 'bower_concat', 'concat', 'clean', 'uglify', 'copy' ]);
  grunt.registerTask('dev',     [ 'jshint', 'less', 'bower_concat', 'concat', 'clean', 'uglify', 'copy', 'connect', 'open', 'watch' ]);

};