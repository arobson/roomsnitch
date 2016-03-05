var path = require( "path" );
var Camera = require( "campi" );
var resemble = require( "node-resemble" );
var when = require( "when" );
var format = require( "util" ).format;

function onError( error ) {
	var message = format( "Failed to capture image because %s", error );
	return { status: 500, data: { message: message } };
}

function onFile( fileName ) {
	var message = format( "Captured new baseline image" );
	return { status: 201, data: { file: fileName, message: message } };
}

function getPath( fileName ) {
	return path.resolve( "./public", fileName );
}

function takeSnapshot( fileName ) {
	if( fileName == null || fileName == "" ) {
		fileName = format( "room-%s.png", new Date().toISOString().replace(/[:.]/g,"-") );
	}
	var filePath = getPath( fileName );
	return when.promise( function( resolve, reject ) {
		var cam = new Camera();
		cam.getImageAsFile( {
			encoding: "png",
			nopreview: true,
			width: 640,
			height: 480,
			timeout: 1
		}, filePath, function( err ) {
			if( err ) {
				reject( err );
			} else {
				resolve( fileName );
			}
		} );
	} );
}

function compare( targetFile, baselineFile ) {
	return when.promise( function( resolve, reject ) {
		if( !baselineFile ) {
			baselineFile = "baseline.png";
		}
		var target = getPath( targetFile );
		var baseline = getPath( baselineFile );
		var diff = resemble( baseline )
			.compareTo( target )
			.ignoreColors()
			.onComplete( function( data ) {
				resolve( {
					mismatch: data.misMatchPercentage,
					current: targetFile,
					baseline: baselineFile,
					diff: data.getImageDataUrl()
				} );				
			} );
	} );
}

module.exports = function() {
	return {
		name: "room",
		actions: {
			snap: {
				method: "POST",
				url: "/",
				handle: function() {
					return takeSnapshot( "baseline.png" )
						.then( onFile, onError );
				}
			},
			check: {
				method: "GET",
				url: "/",
				handle: function() {
					return takeSnapshot()
						.then( compare )
						.then( function( data ) {
							return { status: 200, data: data };
						} );
				}
			}
		}
	};
};
