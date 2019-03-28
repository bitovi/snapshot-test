var stealTools = require("steal-tools");

stealTools.export({
	steal: {
		config: __dirname + "/package.json!npm"
	},
	outputs: {
		"+bundled-es core": {
			addProcessShim: true,
			dest: __dirname + "/dist/snapshot-test.mjs",
			removeDevelopmentCode: false
		}
	}
}).catch(function(e){

	setTimeout(function(){
		throw e;
	},1);

});
