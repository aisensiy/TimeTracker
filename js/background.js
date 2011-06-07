/**
 * convert a Date Object to a string date pattern
 * like xxxx-x-x
 * @param {Date} date
 * @return {string}
 */
Date.date2str = function(date) {
	var str = "";
	str+=date.getFullYear()+"-" + (date.getMonth()+1) + "-" + date.getDate() + " ";
	return str;
};
/**
 * convert a date pattern like xxxx-x-x to a Date Object
 * @param {string} str
 * @return {Date}
 */
Date.str2date = function(str) {
	var date = new Date();
	var dates = str.split(" ");
	date.setFullYear(parseInt(dates[0]));
	date.setMonth(parseInt(dates[1])-1);
	date.setDate(parseInt(dates[2]));
	return date;
};
/**
 * get the date of yesterday, first get
 * the millisecond of today and minus a 
 * day's milliseconds
 * @return {string} xxxx-x-x pattern
 */
Date.getyesterday = function() {
	var date = new Date();
	date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
	return Date.date2str(date);
}
Date.gettoday = function() {
	return Date.date2str(new Date());
}
/**
 * init the localStorage object
 * here variable root is a global variable
 */
function init() {

	if(!localStorage[root]) {
		window.time_tracker = {
			"domains": {}
		};
		localStorage[root] = JSON.stringify(obj);
	} else
		window.time_tracker = JSON.parse(localStorage[root]);
}

/**
 * destory all the thing stored in 
 * localStorage
 */
function destory() {
	if(localStorage[root])
		localStorage.removeItem(root);
	delete window.time_tracker;
}

/**
 * add a new domain to the storage object
 * @param {string} domain
 */
function addDomains(domain) {
	var obj = window.time_tracker;
	obj[domainmap][domain] = {
		"totalTime": 0.0,
		"daily": {}
	};
	localStorage[root] = JSON.stringify(obj);
}

/**
 * delete the domain in the object
 * @param {string} domain
 */
function removeDomain(domain) {
	var obj = window.time_tracker;
	delete obj[domainmap][domain];
	localStorage[root] = JSON.stringify(obj);
}

/**
 * start the counter for a domain, which put
 * a start property in the domain with a value
 * of millisecond right now.
 */
function starttimer(domain) {
	var obj = window.time_tracker;
	if(!obj[domainmap][domain]) {
		addDomains(obj, domain);
	}
	var d = obj[domainmap][domain];
	if(d['start'])
		return;
	d['start'] = (new Date()).getTime();
	localStorage[root] = JSON.stringify(obj);
}

/**
 * 如果没有start属性，退出
 * 获取当前时间，用当前时间减开始时间，存储在|结束时间这天上|
 */
function stoptimer(domain) {
	var obj = window.time_tracker;
	var item = obj[domainmap][domain];
	if(!item.start)
		return;
	var now = new Date();
	var secs = Math.round((now.getTime() - item.start) / 1000.0);
	delete item.start;
	if(secs < 0) {
		return;
	}
	item["daily"][Date.date2str(now)] =
	item["daily"][Date.date2str(now)] ? item["daily"][Date.date2str(now)]+secs : secs;
	item['totalTime'] += secs;
	localStorage[root] = JSON.stringify(obj);
}

/**
 * get the domain from a url
 */
function getDomain(url) {
	var urlRegexp = /^(\w+:\/\/\/?[^\/]+).*$/;
	var match = url.match(urlRegexp);
	if(match)
		return match[1];
	return null;
}

// localStorage['str'] = '';
function checkChromeActive() {
	chrome.windows.getLastFocused( function(wnd) {
		window.oldFocus = window.focus;
		window.focus = wnd.focused ? true : false;
		chrome.tabs.getSelected(wnd.id, function(tab) {
			var domain = getDomain(tab.url);
			if(domain == null) return;
			window.oldurl = window.url;
			window.url = domain;
			setstatus();
		});
	});
}

/**
 * refresh the time
 */
function setstatus() {
	var obj = window.time_tracker;
	var ourl = window.oldurl,
	nurl = window.url,
	of = window.oldFocus,
	nf = window.focus;

	if(!of && nf) {
		starttimer(nurl);
		console.log('from unfocus to focus: ' + nurl + ' start at ' + new Date());
	} else if(of && !nf && ourl) {
		stoptimer(ourl);
		console.log('from focus to unfocus: ' + ourl + ' stop at ' + new Date());
	} else if(of && nf) {
		if(ourl != nurl) {
			console.log('change focus at ' + new Date());
			if(ourl) {
				stoptimer(ourl);
				console.log('stop ' + ourl);
			}
			starttimer(nurl);
			console.log('start ' + nurl);
		}
	}
}

destory();
// chrome.tabs.getSelected(null, function(tab) {
// selectedWnd = tab.windowId;
// });
setInterval(checkChromeActive, 1000);
// chrome.windows.onFocusChanged.addListener( function(winid) {
	// checkChromeActive();
// });