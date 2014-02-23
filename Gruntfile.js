module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %>\n @author <= pkg.author.name <pkg.author.email>\n @version <%= pkg.version %> - Homepage <<%= pkg.homepage %>>\n @copyright (c) 2014 <%= pkg.author.name%> <<%= pkg.homepage %>>\n @license <%= pkg.licenses[0].type%> <<%= pkg.licenses[0].url %>>\n*/\n'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task(s).
	grunt.registerTask('default', ['uglify']);

};