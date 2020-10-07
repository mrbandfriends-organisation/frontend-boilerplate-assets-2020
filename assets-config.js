/**
 * ASSETS FRAMEWORK CONFIG FILE
 *
 * this file provides a simple configuration interface for the assets framework
 * if you have advanced requirements then you might like to edit the webpack.config.js
 * file directly. However, if you choose to do so you should have a VERY good reason
 */

import path from 'path';

// User Config
const config = {
	publicPath: '/app/themes/THEME_NAME/assets/'
	// sourceMapType: 'cheap-module-source-map',
};

export default config;
