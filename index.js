var fs = require('fs');
var path = require('path');
var im = require('imagemagick');
var mkdirp = require('mkdirp');

var targets = {
	"ios": [
		{
			name: 'iTunesArtwork',
			height: 512,
			width: 512,
			radius: 80
		},
		{
			name: 'iTunesArtwork Retina',
			height: 1024,
			width: 1024,
			radius: 160
		},
		{
			name: 'iPhone',
			height: 60,
			width: 60,
			radius: 9
		},
		{
			name: 'iPhone@2x',
			height: 120,
			width: 120,
			radius: 19
		},
		{
			name: 'iPhone@3x',
			height: 180,
			width: 180,
			radius: 28
		},
		{
			name: 'iPad',
			height: 76,
			width: 76,
			radius: 12
		},
		{
			name: 'iPad@2x',
			height: 152,
			width: 152,
			radius: 24
		},
		{
			name: 'icon-57',
			height: 57,
			width: 57,
			radius: 9
		},
		{
			name: 'icon-57-2x',
			height: 114,
			width: 114,
			radius: 18
		},
		{
			name: 'icon-72',
			height: 72,
			width: 72,
			radius: 11
		},
		{
			name: 'icon-72-2x',
			height: 144,
			width: 144,
			radius: 23
		}
	],
	"android": [
		{
			name: 'Google Play',
			height: 512,
			width: 512,
			radius: 80
		},
		{
			name: 'icon-36-ldpi',
			height: 36,
			width: 36,
			radius: 6
		},
		{
			name: 'icon-48-mdpi',
			height: 48,
			width: 48,
			radius: 8
		},
		{
			name: 'icon-72-hdpi',
			height: 72,
			width: 72,
			radius: 11
		},
		{
			name: 'icon-96-xhdpi',
			height: 96,
			width: 96,
			radius: 15
		},
		{
			name: 'icon-144-xxhdpi',
			height: 144,
			width: 144,
			radius: 23
		},
		{
			name: 'icon-192-xxxhdpi',
			height: 192,
			width: 192,
			radius: 30
		}
	]
};

var baseIconPath = process.argv.length > 2 && process.argv[2];
if (!baseIconPath){
	console.error('No base icon has been provided');
	process.exit(1)
}
var relativePath = baseIconPath.indexOf('./') == 0 || baseIconPath.indexOf('../') == 0;
if (relativePath){
	baseIconPath = path.join(process.cwd(), baseIconPath);
}
if (!fs.existsSync(baseIconPath)){
	console.error(baseIconPath + ' cannot be found');
	process.exit(1);
}
if (!fs.statSync(baseIconPath).isFile()){
	console.error(baseIconPath + ' is not a file');
	process.exit(1);
}
if (baseIconPath.lastIndexOf('.png') != baseIconPath.length - 4){
	console.error(baseIconPath + ' doesn\'t seem to be a PNG');
	process.exit(1);
}

var outputFolder = process.argv.length > 3 && process.argv[3];
if (!outputFolder) outputFolder = path.join(process.cwd(), 'output');
console.log('Saving to ' + outputFolder);
if (!fs.existsSync(outputFolder)){
	mkdirp(outputFolder, function(err){
		if (err){
			console.error('Error while creating folder ' + outputFolder);
			console.error(err);
			process.exit(1);
		}
		conversion();
	});
} else conversion();

function conversion(){
	var iTarget = 0;
	var iPlatform = 0;
	var currentPlatform;
	var currentTargets;
	var currentFolder;
	var platforms = Object.keys(targets);

	function processPlatform(){
		currentPlatform = platforms[iPlatform];
		console.log('Current platform: ' + currentPlatform);
		currentTargets = targets[currentPlatform];
		currentFolder = path.join(outputFolder, currentPlatform);
		iTarget = 0;

		mkdirp(currentFolder, function(err){
			if (err){
				console.error('Error while creating folder for platform ' + currentPlatform);
				console.error(err);
				process.exit(1);
			}
			processOne(platformEnd);
		});

		function platformEnd(){
			iPlatform++;
			if (iPlatform == platforms.length){
				console.log('Done!');
			} else {
				processPlatform();
			}
		}
	}

	function processOne(end){
		var currentTarget = currentTargets[iTarget];
		var padding = currentTarget.radius / 2;
		//var baseImage = gm(baseIconPath);
		var destination = path.join(currentFolder, currentTarget.name + '.png');
		var maskDest = path.join(outputFolder, 'mask.png');
		var resizedDest = path.join(outputFolder, 'resized.png');
		console.log('Converting for ' + currentTarget.name);
		im.convert([
			'-size', currentTarget.width + 'x' + currentTarget.height,
			'xc:none',
			'-draw',
			'roundrectangle 0,0,' + currentTarget.width + ',' + currentTarget.height + ',' + currentTarget.radius + ',' + currentTarget.radius,
			maskDest
		], function(err){
			if (err){
				console.error('Error with ImageMagick: ' + err);
				process.exit(1);
			}

			im.convert([
				baseIconPath,
				'-resize', (currentTarget.width - 2 * padding).toString() + 'x' + (currentTarget.height - 2 * padding).toString(),
				resizedDest
			], function(err){
				if (err){
					console.error('Error with ImageMagick: ' + err);
					process.exit(1);
				}

				im.convert([
					'-size', currentTarget.width + 'x' + currentTarget.height,
					'xc:white',
					resizedDest, '-geometry', '+' + padding + '+' + padding, '-composite',
					'-matte',
					maskDest,
					'-compose',
					'DstIn',
					'-composite', destination
				], function(err){
					if (err){
						console.error('Error with ImageMagick: ' + err);
						process.exit(1);
					}

					iTarget++;
					if (iTarget == currentTargets.length){
						end()
					} else {
						processOne(end);
					}
				});
			});
		});
	}

	processPlatform();

}
