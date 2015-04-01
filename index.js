var fs = require('fs');
var path = require('path');
var im = require('imagemagick');
var mkdirp = require('mkdirp');

var targets = [
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
		name: 'Google Play',
		height: 512,
		width: 512,
		radius: 80
	},
	{
		name: 'Android-ldpi',
		height: 36,
		width: 36,
		radius: 6
	},
	{
		name: 'Android-mdpi',
		height: 48,
		width: 48,
		radius: 8
	},
	{
		name: 'Android-hdpi',
		height: 72,
		width: 72,
		radius: 11
	},
	{
		name: 'Android-xhdpi',
		height: 96,
		width: 96,
		radius: 15
	},
	{
		name: 'Android-xxhdpi',
		height: 144,
		width: 144,
		radius: 23
	},
	{
		name: 'Android-xxxhdpi',
		height: 192,
		width: 192,
		radius: 30
	}
];

var iTarget = 0;

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
			process.exit(1);
		}
		processOne();
	});
} else processOne();

function processOne(){
	var currentTarget = targets[iTarget];
	//var baseImage = gm(baseIconPath);
	var destination = path.join(outputFolder, currentTarget.name + '.png');
	var maskDest = path.join(outputFolder, 'mask.png');
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
			'-resize', currentTarget.width + 'x' + currentTarget.height,
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
			if (iTarget == targets.length){
				console.log('Done');
			} else {
				processOne();
			}
		});
	});
}
