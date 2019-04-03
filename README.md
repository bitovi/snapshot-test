# @bitovi/snapshot-test

Take an image of an iframe and compare it to a
saved image.

```js
import {compareToSnapshot} from "@bitovi/snapshot-test";

compareToSnapshot({
	// A URL you want to test against.
	// Must be same domain.
	url: "./style-guide.html",

	// The width and height of an iframe used
	// to load the URL. The <body> will be rendered.
	// So if your <body> is greater than `height`
	// an image of that size will be created.
	width: 1000, // defaults to 1000
	height: 400, // defaults to 400

	// The path to where to keep your saved images.
	snapshotDir: "./",

	// An identifier used to figure out the saved
	// image's path.
	//
	// For example, if the tests were running in google `chrome`
	// on a `high definition` display, an image would be looked
	// in the following places:
	//
	// 1. style-guide-1000-hd-chrome.png
	// 2. style-guide-1000-hd.png
	// 3. style-guide.png
	snapshotPrefix: "style-guide",

	// This function is called after the iframe has loaded.
	// You can make adjustments to the document before the snapshot
	// is taken. This function should return a promise when
	// the snapshot is ready to be taken.
	prepareDocument(iframe) { return Promise },

	// Options passed to pixelmatch that does the diff.
	pixelMatchOptions: { ... }

})
// `compareToSnapshot` returns a promise.
.then(function(){
	// If the promise resolves, the images are equal.
	// You should pass your test!
}, function(err) {
	// If the promise rejects, the images are not equal!
	// You should fail your test.

	// An err object is returned with useful information.

	// A DOM element you can insert
	// to see the difference and save a new snapshot.
	err.html
});
```
