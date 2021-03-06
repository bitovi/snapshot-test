import html2canvas from "./html2canvas";
import {detect} from "detect-browser";
import pixelmatch from "pixelmatch";

// ## Basic Helpers
export function getIndex(data, x, y) {
	return (y * data.width * 4) + x * 4;
}
export function getXYChoord(data, index) {
	return [
		index % (data.width * 4),
		Math.floor(index / (data.width * 4))
	];
}
export function ave(num1, num2) {
	return Math.floor((num1+num2) / 2 );
}
export function getPixel(data, x, y) {
	var index = getIndex(data, x, y);
	return data.data.slice(index, index+4);
}
export function pixelEqual(p1, p2) {
	return p1[0] === p2[0] && p1[1] === p2[1] && p1[2] === p2[2] && p1[3] === p2[3];
}

// ## Canvas  utils

var tempCanvas = document.createElement("canvas");
var tempCtx = tempCanvas.getContext("2d");
export function resizeCanvas(canvas, scale) {
	var cw = tempCanvas.width = canvas.width;
	var ch = tempCanvas.height = canvas.height;

	tempCtx.drawImage(canvas,0,0);

	canvas.width *= scale;
	canvas.height *= scale;
	canvas.style.width = "";
	canvas.style.height = "";
	var ctx=canvas.getContext('2d');
	ctx.drawImage(tempCanvas,0,0,cw,ch,0,0, cw*scale,ch*scale );
}

export function copyTo(canvas, newWidth, newHeight) {
	var newCanvas = document.createElement("canvas");
	newCanvas.width = newWidth;
	newCanvas.height = newHeight;
	var newCtx = newCanvas.getContext("2d");
	if(canvas.getContext) {
		newCtx.drawImage(canvas,0,0,canvas.width,canvas.height,0,0, canvas.width,canvas.height );
	} else {
		newCtx.putImageData(canvas,0,0 );
	}

	return newCanvas;
}

export function stretchToWidth(canvas, newWidth) {
	var newHeight = canvas.height * ( newWidth / canvas.width );
	var newCanvas = document.createElement("canvas");
	newCanvas.width = newWidth;
	newCanvas.height = newHeight;
	var newCtx = newCanvas.getContext("2d");

	newCtx.drawImage(canvas,0,0,canvas.width,canvas.height,0,0, newWidth,newHeight );
	return newCanvas;
}

function getImageData(image) {
	if(image.getContext) {
		var ctx = image.getContext('2d');
		return ctx.getImageData(0,0, image.width, image.height);
	} else {
		return image;
	}
}


// ## Image or Canvas comparisons

export function dataEqual(data1, data2) {
	data1 = getImageData(data1);
	data2 = getImageData(data2);

	var len = data1.data.length;
	for(var i = 0 ; i < len; i++) {
		if(data1.data[i] !== data2.data[i]) {
			console.log("difference at ",getXYChoord(data1, i));
			return false;
		}
	}
	return true;
}



export function diff(newImage, oldImage, pixelMatchOptions) {

	pixelMatchOptions = pixelMatchOptions || {threshold: 0.0};

	var maxWidth = Math.max(newImage.width, oldImage.width),
		maxHeight = Math.max(newImage.height, oldImage.height);

	newImage = getImageData(newImage);
	oldImage = getImageData(oldImage);

	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext('2d');
	var diffOut = ctx.createImageData(maxWidth, maxHeight);
	canvas.width = maxWidth;
	canvas.height = maxHeight;

	var mismatched = pixelmatch(newImage.data, oldImage.data, diffOut.data, maxWidth, maxHeight, pixelMatchOptions);

	if( mismatched ){
		ctx.putImageData(diffOut, 0, 0);
		return canvas;
	}

}

export function basicDiff(newImage, oldImage) {
	newImage = getImageData(newImage);
	oldImage = getImageData(oldImage);

	// find the minimal dimension
	var canvas = document.createElement("canvas");

	var maxWidth = Math.max(newImage.width, oldImage.width),
		minWidth = Math.min(newImage.width, oldImage.width),
		minHeight = Math.min(newImage.height, oldImage.height),
		maxHeight = Math.max(newImage.height, oldImage.height);

	canvas.width = maxWidth;
	canvas.height = maxHeight;
	var ctx = canvas.getContext('2d');
	var diffOut = ctx.createImageData(maxWidth, maxHeight);
	var equal = true;

	for(var y = 0; y < maxHeight; y++) {
		for(var x = 0; x < maxWidth; x++) {

			var newPixel = getPixel(newImage, x, y);
			var oldPixel = getPixel(oldImage, x, y);
			var index = getIndex(diffOut, x, y);

			if( !pixelEqual(newPixel, oldPixel) ) {
				equal = false;
				// average numbers and max out red ...
				diffOut.data[index] = 255;
				diffOut.data[index+1] = ave(newPixel[1] , oldPixel[1]);
				diffOut.data[index+2] = ave(newPixel[2] , oldPixel[2]);
				diffOut.data[index+3] = 255;
			} else {
				diffOut.data[index] = newPixel[0];
				diffOut.data[index+1] = newPixel[1];
				diffOut.data[index+2] = newPixel[2];
				diffOut.data[index+3] = newPixel[3];
			}
		}
	}
	if(equal) {
		return;
	} else {
		ctx.putImageData(diffOut, 0, 0);
		return canvas;
	}
}

export function downloadLink(canvas, title, text) {
	var anchor = document.createElement("a");
	anchor.setAttribute("download", title);
	var url = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

	anchor.setAttribute("href", url );
	anchor.textContent = text;
	return anchor;
}

function makeBoxForCanvas(canvas, title) {
	var div = document.createElement("div");
	div.style.display = "inline-block";
	div.style.border = "solid 1px black";
	div.style.verticalAlign = "text-top";
	var paragraph = document.createElement("p");
	paragraph.textContent = title;
	div.appendChild(paragraph);
	div.appendChild(canvas);
	return div;
}

function getWidth(){
	return Math.max(
		document.body.scrollWidth,
		document.documentElement.scrollWidth,
		document.body.offsetWidth,
		document.documentElement.offsetWidth,
		document.documentElement.clientWidth
	);
}

export function diffContent(diffCanvas, newCanvas, oldCanvas, imageName, attempts) {
	var width = Math.floor( getWidth() / 3 ) - 50;

	// get links

	var diffSized = stretchToWidth(diffCanvas, width);
	var newSized = stretchToWidth(newCanvas, width);
	var oldSized = stretchToWidth(oldCanvas, width);

	var diffContent = makeBoxForCanvas(diffSized, "Difference:");
	var newContent = makeBoxForCanvas(newSized, "Current Rendering (downloads below image):");

	newContent.appendChild( ulForAttempts(attempts, newCanvas) );

	var oldContent = makeBoxForCanvas(oldSized, imageName);

	var div = document.createElement("div");
	div.appendChild(diffContent);
	div.appendChild(newContent);
	div.appendChild(oldContent);
	return div;
}

function ulForAttempts(attempts, canvas) {
	var ul = document.createElement("ul");
	attempts.forEach(function(imageName){
		var newCanvasDownload = downloadLink(canvas,imageName, imageName);
		var li = document.createElement("li");
		li.appendChild(newCanvasDownload);
		ul.appendChild(li);
	});
	return ul;
}

/**
{
	url: "../doc/training/style-guide.html",
	width: 1000,
	snapshotDir: "./",
	snapshotPrefix: "style-guide"
}
 */
export function compareToSnapshot(options) {

	var htmlPromise = getCanvasForUrl(options);
	return Promise.all([
		htmlPromise,
		findImage(options)
	]).then(function(results){
		var iframeCanvas = results[0];
		var imageCanvas = results[1].canvas;
		var imageName = results[1].name;

		var next = downloadLink(iframeCanvas,imageName, imageName);
		//console.log("lastLink", localStorage.getItem("initial") === next.getAttribute("href") );

		var diffCanvas = diff(iframeCanvas, imageCanvas, options.pixelMatchOptions);
		if(diffCanvas) {
			return Promise.reject({
				html: diffContent(diffCanvas, iframeCanvas, imageCanvas, imageName, results[1].attempts),
				imageName: imageName
			});
		} else {
			return {imageName: imageName};
		}
	}, function(err){
		return htmlPromise.then(function(iframeCanvas){

			/*var image = getImageData(iframeCanvas);
			var pixel = getPixel(image, 221, 54);
			var eq = pixelEqual(pixel, [238, 238, 239, 255]);*/

			//localStorage.setItem("initial",newCanvasDownload.getAttribute("href"));
			var p = document.createElement("p");
			p.textContent = "There is no snapshot. Download one of the following snapshots by right-clicking "+
				"the link and selecting 'Save Link As...'. Downloads are ordered by specificity:";

			var ul = ulForAttempts(err.attempts, iframeCanvas);
			p.appendChild(ul);
			return Promise.reject({
				attempts: err.attempts,
				html: p
			});
		});

	});
}


export function findImage(options){
	var browser = detect();
	var dpr = (document.defaultView.devicePixelRatio || 1);
	var dprName = dpr === 1 ? "sd" : (dpr === 2 ? "hd" : "dpr"+dpr);

	var attempts = [
		options.snapshotPrefix+"-"+options.width+"-"+dprName+"-"+browser.name+".png",
		options.snapshotPrefix+"-"+options.width+"-"+dprName+".png",
		options.snapshotPrefix+"-"+options.width+".png",
		options.snapshotPrefix+".png"
	];

	var base = Promise.reject();

	attempts.forEach(function(name){
		base = base.catch(function(){
			return getCanvasForImage(options.snapshotDir+name).then(function(canvas){
				return {canvas: canvas, name: name, attempts: attempts};
			});
		});
	});

	return base.catch(function(){
		return Promise.reject({
			attempts: attempts
		});
	});
}

// ## Helpers that get canvases
export function getCanvasForUrl(options) {
	return new Promise(function(resolve, reject){
		var div = document.createElement("div");
		div.style.position = "fixed";
		div.style.top = div.style.left = "0px";
		div.style.height = (options.height || 1000) +"px";
		div.style.width = (options.width || 1000)+"px";
		document.body.appendChild(div);
		//var fixture = document.getElementById("qunit-fixture");

		var iframe = document.createElement("iframe");
		iframe.style.width = "100%";
		iframe.style.height = "100%";
		iframe.style.backgroundColor = "white";
		iframe.src = options.url;

		function takeSnapshot(){
			html2canvas(iframe.contentWindow.document.body, {
				allowTaint: true,
				foreignObjectRendering: true,
				useCORS: true,
				windowWidth: options.width,
				width: options.width,
				devicePixelRatio: 1
			})
				.then(resolve, reject).then(function(){
					setTimeout(function(){
						document.body.removeChild(div);
					},13);

				});
		}

		iframe.onload = function(){
			setTimeout(function(){
				if(options.prepareDocument) {
					options.prepareDocument(iframe).then(takeSnapshot);
				} else {
					takeSnapshot();
				}
			},13);
		};
		div.appendChild(iframe);
	});

}

export function getCanvasForImage(url) {
	return new Promise(function(resolve, reject){
		var image = new Image();

		image.onload = function(){
			var canvas = document.createElement("canvas");
			//document.body.appendChild(canvas);

			canvas.width  = image.width;
			canvas.height = image.height;

			var context = canvas.getContext("2d");

			context.drawImage(image, 0, 0);
			resolve(canvas);
		};
		image.onerror = reject;

		image.src = url;


	});

}
