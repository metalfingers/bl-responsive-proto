module.exports = function(grunt){

  var os = require('os'),
      ifaces = os.networkInterfaces(),
      ipAddress = null,
      FakeException = {};
  


  // This bit takes the first IPv4 address in the networkinterfaces object
  // and assigns it to the ipAddress variable. It ignores lo0 (loopback / 127.0.0.1).
  try {
    for (var dev in ifaces) {

        if(dev === "lo0") {
            continue;
        }
        ifaces[dev].forEach(function(details) {
          if (details.family=='IPv4') {
            ipAddress = details.address;
            throw FakeException; // throw an exception here because node squalks if a break statement is used.
          }
        });

    }
  } catch(e) {
    if(e !== FakeException) throw e;
  }


	grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    build: {
      ipAddress: ipAddress,
      srcRoot: './_src',
      destRoot: './_dist',
      tmp: './.tmp/',
      css: {
        src: '_src/sass',
        dest: '_dist/css'
      },
      fonts: {
        src: '_src/fonts',
        dest: '_dist/fonts'
      },
      img: {
        src: '_src/img',
        dest: '_dist/img'
      },
      js: {
        src: './_src/js',
        dest: './_dist/js'
      },
      html: {
        src: './_src/**/*.html',
        dest: './_dist/'
      },
      pdf: {
        src: './_src/pdf',
        dest: './_dist/pdf'
      },
      misc: {
        src: './_src/.htaccess',
        dest: './_dist/.htaccess',
      }
    },

    clean: {
     css: '<%= build.css.dest %>',
     img: '<%= build.img.dest %>',
     js: '<%= build.js.dest %>',
     html: '<%= build.html.dest %>/*.html',
     pdf: '<%= build.pdf.dest %>',
     tmp: '<%= build.tmp %>'
    },

    concat: {
      options: {
        separator: ';\n'
      },
      dev: {
        src: [
              '<%= build.js.src %>/vendor/jquery-1.11.1.min.js',
              '<%= build.js.src %>/vendor/jquery-ui.min.js',
              '<%= build.js.src %>/vendor/lodash.underscore.min.js',
              '<%= build.js.src %>/vendor/foundation.min.js',
              '<%= build.js.src %>/vendor/waypoints.min.js',
              '<%= build.js.src %>/vendor/waypoints-sticky.min.js',
              '<%= build.js.src %>/lookbook.js',
              '<%= build.js.src %>/scripts.js'],
        dest: '<%= build.js.dest %>/scripts.min.js'
      },
      prod: {
        src: [
              '<%= build.tmp %>/vendor/jquery-1.11.1.min.js',
              '<%= build.js.src %>/vendor/jquery-ui.min.js',
              '<%= build.tmp %>/vendor/lodash.underscore.min.js',
              '<%= build.js.src %>/vendor/foundation.min.js',
              '<%= build.js.src %>/vendor/waypoints.min.js',
              '<%= build.js.src %>/vendor/waypoints-sticky.min.js',
              '<%= build.tmp %>/lookbook.js',
              '<%= build.tmp %>/scripts.js'],
        dest: '<%= build.js.dest %>/scripts.min.js'
      }
    },

    copy: {
      img: {
        files: [{
          expand: true,
          cwd: '<%= build.img.src %>',
          src: '**/*',
          dest: '<%= build.img.dest %>/'
        }]
      },
      fonts: {
        files: [{
          expand: true,
          cwd: '<%= build.fonts.src %>',
          src: '**/*',
          dest: '<%= build.fonts.dest %>/'
        }]
      },
      html: {
        files: [{
          expand: true,
          cwd: '<%= build.srcRoot %>',
          src: '*.html',
          dest: '<%= build.html.dest %>'
        }]
      },
      jsStandAlones: {
        files: [{
          expand: true,
          cwd: '<%= build.js.src %>',
          src: ['webtrends.js','html5shiv.min.js'],
          dest: '<%= build.js.dest %>'
        }]
      },
      pdf: {
        files: [{
          expand: true,
          cwd: '<%= build.pdf.src %>',
          src: '**/*',
          dest: '<%= build.pdf.dest %>'
        }]
      },
      misc: {
        files: [{
          expand: true,
          cwd: '<%= build.srcRoot %>',
          src: '.htaccess',
          dest: '<%= build.destRoot %>'
        }]
      }
    },

    imagemin: {
      prod: {
        options: {
          optimizationLevel: 3
        },
        files: [{
          expand: true,
          cwd: '<%= build.img.src %>/',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= build.img.dest %>/'
        }]
      }
    },

    includereplace: {
      dev: {
        options: {
          includesDir: '<%= build.srcRoot %>',
          processIncludeContents: function(content, vars){
            if (vars.liveReload === "true") {
              content += '\n<script src="//' + grunt.config.data.build.ipAddress + ':35729/livereload.js"></script>';
            }
            return content;
          }
        },
        files: [{
          expand: true,
          cwd: '<%= build.srcRoot %>',
          src: '*.css',
          dest: '<%= build.html.dest %>'          
        }]
      },
      prod: {
        options: {
          includesDir: '<%= build.srcRoot %>',
          processIncludeContents: function(content, vars){
            content = content.replace('../img/', '/web20/assets/img/specialProjects/lookbook-vertical/');

            return content;
          }
        },
        files: [{
          expand: true,
          cwd: '<%= build.css.dest %>',
          src: '*.css',
          dest: '<%= build.css.dest %>'          
        }]
      }
    },

		sass: {
      dev: {
        options: {
          compass: true,
          debugInfo: false,
          lineNumbers: false,
          style: 'expanded',
          sourcemap: 'auto'
        },
        files: {
          '<%= build.css.dest %>/main.css' : '<%= build.css.src %>/main_dev.scss',
          '<%= build.css.dest %>/sunshop.css' : '<%= build.css.src %>/sunshop_dev.scss'
        }
      },
      prod: {
        options: {
          compass: true,
          style: 'compressed',
          sourcemap: 'none'
        },
        files: {
          '<%= build.css.dest %>/main.css' : '<%= build.css.src %>/main.scss',
          '<%= build.css.dest %>/sunshop.css' : '<%= build.css.src %>/sunshop.scss'
        }
      }
    },

    uglify: {
      options: {
        mangle: {
          except: ['jQuery', 'Backbone', '_']
        },
        compress: {
          drop_console: true
        }
      },
      prod: {
        files: [{
          expand: true,
          cwd: '<%= build.js.src %>',
          src: '**/*.js',
          dest: '<%= build.tmp %>'
        }]
      }
    },

    watch: {
      html: {
        options: { livereload: true },
        files: '<%= build.html.src %>',
        tasks: 'buildHTML'
      },
      img: {
        options: { livereload: true },
        files: '<%= build.img.src %>/**/*.{gif,jpg,jpeg,png}',
        tasks: 'buildIMG'
      },
      js: {
        options: { livereload: true },
        files: '<%= build.js.src %>/**/*.js',
        tasks: 'buildJS'
      },
      css: {
        options: { livereload: true },
        files: '<%= build.css.src %>/**/*.{sass,scss}',
        tasks: 'buildCSS'
      }
    }

	});

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('buildCSS', 'Build the CSS files', function(mode){
    grunt.task.run('clean:css');
   
    if (mode === 'prod') {
      grunt.task.run('sass:prod');
    } else {
      grunt.task.run('sass:dev');
    }
  
  });


	grunt.registerTask('buildJS', 'Build the JS files', function(mode){
    grunt.task.run('clean:js');
  
    if (mode === 'prod') {
      grunt.task.run('clean:tmp');
      grunt.task.run('uglify');
      grunt.task.run('concat:prod');
    } else {
      grunt.task.run('concat:dev');
    }

    grunt.task.run('copy:jsStandAlones');
	
  });


  grunt.registerTask('buildIMG', 'Build the IMG files', function(mode){
    grunt.task.run('clean:img');
   
    if (mode === 'prod') {
      grunt.task.run('clean:tmp');
      grunt.task.run('imagemin:prod');
    } else {
      grunt.task.run('copy:img');
    }
  
  });


	grunt.registerTask('buildHTML', 'Build the HTMLs', function(mode) {
    grunt.task.run('clean:html');

    if (mode === 'prod') {
      grunt.task.run('includereplace:prod');
      grunt.task.run('copy:misc');
    } else {
      grunt.task.run('includereplace:dev');
      grunt.task.run('copy:misc');
    }
  });

  grunt.registerTask('buildPDF', function(mode){
    grunt.task.run('copy:pdf');
  });

  grunt.registerTask('buildFONTS', function(mode){
    grunt.task.run('copy:fonts');
  });

  grunt.registerTask('build', 'Build every damn thing', function(mode){
    grunt.task.run('buildCSS:' + mode);
    grunt.task.run('buildHTML:' + mode);
    grunt.task.run('buildIMG:' + mode);
    grunt.task.run('buildJS:' + mode);
    grunt.task.run('buildPDF:' + mode);
  });

};
