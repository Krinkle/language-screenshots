var By = require( 'selenium-webdriver' ).By,
	until = require( 'selenium-webdriver' ).until,
	chrome = require( 'selenium-webdriver/chrome' ),
	test = require( 'selenium-webdriver/testing' ),
	fs = require( 'fs' ),
	Jimp = require( 'jimp' ),
	lang = 'en';

test.describe( 'Screenshot', function () {
	var driver;

	function runScreenshotTest( name, clientScript, padding ) {
		var filename = name + '-' + lang + '.png';
		driver.get( 'http://en.wikipedia.beta.wmflabs.org/wiki/PageDoesNotExist?veaction=edit&uselang=' + lang );
		driver.wait(
			driver.executeAsyncScript(
				// This function is converted to a string and executed in the browser
				function () {
					var done = arguments[ arguments.length - 1 ];

					window.seleniumUtils = {
						getBoundingRect: function ( elements ) {
							var boundingRect;
							for ( i = 0, l = elements.length; i < l; i++ ) {
								rect = elements[ i ].getBoundingClientRect();
								if ( !boundingRect ) {
									boundingRect = {
										left: rect.left,
										top: rect.top,
										right: rect.right,
										bottom: rect.bottom
									};
								} else {
									boundingRect.left = Math.min( boundingRect.left, rect.left );
									boundingRect.top = Math.min( boundingRect.top, rect.top );
									boundingRect.right = Math.max( boundingRect.right, rect.right );
									boundingRect.bottom = Math.max( boundingRect.bottom, rect.bottom );
								}
							}
							if ( boundingRect ) {
								boundingRect.width = boundingRect.right - boundingRect.left;
								boundingRect.height = boundingRect.bottom - boundingRect.top;
							}
							return boundingRect;
						}
					};

					// Suppress welcome dialog
					localStorage.setItem( 've-beta-welcome-dialog', 1 );
					// Suppress user education indicators
					localStorage.setItem( 've-hideusered', 1 );
					mw.hook( 've.activationComplete' ).add( function () {
						var target = ve.init.target,
							surfaceView = target.getSurface().getView();
						// Hide edit notices
						target.actionsToolbar.tools.notices.getPopup().toggle( false );
						// Wait for focus
						surfaceView.once( 'focus', done );
					} );
				}
			).then( function () {
				return driver.executeAsyncScript( clientScript ).then( function ( rect ) {
					return driver.takeScreenshot().then( function ( image ) {
						if ( rect ) {
							return cropScreenshot( filename, image, rect, padding );
						} else {
							fs.writeFile( filename, image, 'base64' );
						}
					} );
				} );
			} ),
			20000
		);
	}

	function cropScreenshot( filename, image, rect, padding ) {
		var temp = 'temp-' + Math.random() + '.tmp.png';

		if ( padding === undefined ) {
			padding = 5;
		}

		fs.writeFileSync( temp, image, 'base64' );

		return Jimp.read( temp ).then( function ( jimpImage ) {
			fs.unlinkSync( temp );
			jimpImage
				.crop(
					rect.left - padding,
					rect.top - padding,
					rect.width + ( padding * 2 ),
					rect.height + ( padding * 2 )
				)
				.write( filename );
		} );
	}

	test.beforeEach( function () {
		driver = new chrome.Driver();
		driver.manage().timeouts().setScriptTimeout( 20000 );
		driver.manage().window().setSize( 1200, 800 );
	} );

	test.afterEach( function () {
		driver.quit();
	} );

	test.it( 'Toolbar', function () {
		runScreenshotTest( 'VisualEditor_toolbar',
			// This function is converted to a string and executed in the browser
			function () {
				var done = arguments[ arguments.length - 1 ];
				done(
					seleniumUtils.getBoundingRect( [
						ve.init.target.toolbar.$element[ 0 ],
						$( '#ca-nstab-main' )[ 0 ]
					]
				) );
			},
			0
		);
	} );
	test.it( 'Citoid inspector', function () {
		runScreenshotTest( 'VisualEditor_Citoid_Inspector',
			// This function is converted to a string and executed in the browser
			function () {
				var done = arguments[ arguments.length - 1 ];
				ve.init.target.toolbar.tools.citefromid.onSelect();
				setTimeout( function () {
					var rect = ve.init.target.surface.context.inspectors.currentWindow.$element[ 0 ].getBoundingClientRect();
					done( {
						top: rect.top - 20,
						left: rect.left,
						width: rect.width,
						height: rect.height + 20
					} );
				}, 500 );
			}
		);
	} );
	test.it( 'Headings tool list', function () {
		runScreenshotTest( 'VisualEditor_Toolbar_Headings',
			// This function is converted to a string and executed in the browser
			function () {
				var done = arguments[ arguments.length - 1 ],
					toolGroup = ve.init.target.toolbar.tools.paragraph.toolGroup;
				toolGroup.setActive( true );
				setTimeout( function () {
					done(
						seleniumUtils.getBoundingRect( [
							toolGroup.$element[ 0 ],
							toolGroup.$group[ 0 ]
						]
					) );
				}, 500 );
			}
		);
	} );
	test.it( 'Text style tool list', function () {
		runScreenshotTest( 'VisualEditor_Toolbar_Formatting',
			// This function is converted to a string and executed in the browser
			function () {
				var done = arguments[ arguments.length - 1 ],
					toolGroup = ve.init.target.toolbar.tools.bold.toolGroup;
				toolGroup.setActive( true );
				toolGroup.getExpandCollapseTool().onSelect();
				setTimeout( function () {
					done(
						seleniumUtils.getBoundingRect( [
							toolGroup.$element[ 0 ],
							toolGroup.$group[ 0 ]
						]
					) );
				}, 500 );
			}
		);
	} );
	test.it( 'Indentation tool list', function () {
		runScreenshotTest( 'VisualEditor_Toolbar_List_and_indentation',
			// This function is converted to a string and executed in the browser
			function () {
				var done = arguments[ arguments.length - 1 ],
					toolGroup = ve.init.target.toolbar.tools.bullet.toolGroup;
				toolGroup.setActive( true );
				setTimeout( function () {
					done(
						seleniumUtils.getBoundingRect( [
							toolGroup.$element[ 0 ],
							toolGroup.$group[ 0 ]
						]
					) );
				}, 500 );
			}
		);
	} );
	test.it( 'Page options list', function () {
		runScreenshotTest( 'VisualEditor_More_Settings',
			// This function is converted to a string and executed in the browser
			function () {
				var done = arguments[ arguments.length - 1 ],
					toolGroup = ve.init.target.actionsToolbar.tools.advancedSettings.toolGroup;
				toolGroup.setActive( true );
				setTimeout( function () {
					done(
						seleniumUtils.getBoundingRect( [
							toolGroup.$element[ 0 ],
							toolGroup.$group[ 0 ],
							// Include save button for context
							ve.init.target.toolbarSaveButton.$element[ 0 ]
						]
					) );
				}, 500 );
			}
		);
	} );
	test.it( 'Special character inserter', function () {
		runScreenshotTest( 'VisualEditor_Toolbar_SpecialCharacters',
			// This function is converted to a string and executed in the browser
			function () {
				var done = arguments[ arguments.length - 1 ];
				ve.init.target.toolbar.tools.specialCharacter.onSelect();
				setTimeout( function () {
					done(
						seleniumUtils.getBoundingRect( [
							ve.init.target.toolbar.tools.specialCharacter.$element[ 0 ],
							ve.init.target.surface.toolbarDialogs.$element[ 0 ]
						]
					) );
				}, 500 );
			}
		);
	} );
} );
