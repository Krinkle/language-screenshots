module.exports = function ( grunt ) {

	// Project configuration.
	grunt.initConfig( {
		// Configure a mochaTest task
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					timeout: 10000
				},
				src: [ 'test/**/*.js' ]
			}
		}
	} );

	// Add the grunt-mocha-test tasks.
	grunt.loadNpmTasks( 'grunt-mocha-test' );

	// Default task(s).
	grunt.registerTask( 'default', [ 'mochaTest' ] );

};
