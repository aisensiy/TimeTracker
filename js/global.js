/*
 * Here is some global variables and function which can be used
 * in both popup page, option page and background page
 */

var root = 'time_tracker_ext';
var domainmap = "domains";

function secs2format(secs) {
	return {
		'd':parseInt(secs/60/24/60),
		'h':parseInt(secs/60 % (24*60) / 60),
		'm':parseInt(secs/60 % (60*24) % 60),
		's':parseInt(secs % 60)
	};
}