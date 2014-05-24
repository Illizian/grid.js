/*
 * @Author: alex
 * @Date:   2014-05-24 00:42:19
 * @Last Modified by:   alex
 * @Last Modified time: 2014-05-24 12:57:15
 *
 * Utility functions
 * A place to keep any handy functions
 */
var debug = false;
var logger = function (message) {
	if(!_.isUndefined(debug) && debug) console.log(message);
};