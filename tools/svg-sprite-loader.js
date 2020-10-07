/**
 * SVG LOADER
 * manually requires all SVG sprites into the bundle which causes the contents
 * to be handled by webpack. Without this Webpack wouldn't know about the files
 * and thus they wouldn't be processed. 
 */

function importAll(r) {
	r.keys().forEach(function(key) {
		req(key);
	});
}

importAll(require.context('../src/svg/sprites/', true, /\.svg$/));
