module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({
	  pkg: grunt.file.readJSON('package.json'),
		browserify: {
			dist: {
				watch: true,
				keepAlive: true,
				files: {
					'dist/nsyslog-parser.js': ['browser.js']
				}
			}
		},
		babel: {
			options: {
				sourceMap: true,
				presets: ['@babel/preset-env']
			},
			dist: {
				files: {
					'dist/nsyslog-parser.js': 'dist/nsyslog-parser.js'
				}
			}
		},
	  uglify: {
	    options: {
	      banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
	    },
			build: {
      	src: 'dist/nsyslog-parser.js',
      	dest: 'dist/nsyslog-parser.min.js'
    	}
	  },
		clean: ['dist/nsyslog-parser.js','nsyslog-parser.js.map']
	});

	grunt.registerTask('default', ['browserify','babel','uglify']);
};
