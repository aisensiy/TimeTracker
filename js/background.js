//group
function destoryGroup() {
	if(localStorage.time_tracker_group)
		localStorage.removeItem('time_tracker_group');
	delete window.group;
}
function initGroup() {
	if(!localStorage.time_tracker_group)
		localStorage.time_tracker_group = JSON.stringify({});
	window.group = JSON.parse(localStorage.time_tracker_group); 
}

function createGroup(name) {
	var gs = window.group;
	if(gs[name]) {
		console.log(name + ' has created.');
		return false;
	}
	gs[name] = [];
	localStorage.time_tracker_group = JSON.stringify(gs);
	console.log('create group ' + name);
	return true;
}

function addDomainToGroup(domain, group) {
	var gs = window.group;
	gs[group].push(domain);
	localStorage.time_tracker_group = JSON.stringify(gs);
	console.log('add ' + domain + ' to group ' + group);	
}

function deleteGroup(group) {
	var gs = window.group;
	delete gs[group];
	localStorage.time_tracker_group = JSON.stringify(gs);
	console.log('delete group ' + group);
}

function renameGroup(oldname, newname) {
	var gs = window.group;
	if(gs[newname]) {
		console.log('group ' + newname + ' exists');
		return false;
	} else {
		gs[newname] = gs[oldname];
		delete gs[oldname];
		localStorage.time_tracker_group = JSON.stringify(gs);
		console.log('rename group ' + oldname + ' to ' + newname);
		return true;
	}
}

function deleteDomainFromGroup(domain, group) {
	var gs = window.group;
	for(var i=0; i<gs[group].length; i++) {
		if(gs[group][i] == domain) {
			gs[group].splice(i, 1);
			console.log('delete ' + domain + ' in group ' + group);
			break;
		}
	}
	localStorage.time_tracker_group = JSON.stringify(gs);
}
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
	return [Date.date2str(date)];
};
Date.gettoday = function() {
	return [Date.date2str(new Date())];
};
Date.thisweek = function() {
	var a = [];
	var date = new Date();
	do {
		a.push(Date.date2str(date));
		date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
	} while(date.getDay() != 0);
	return a;
};
Date.lastweek = function() {
	var a = [];
	var date = new Date();
	do {
		date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
	} while(date.getDay() != 0);
	do {
		a.push(Date.date2str(date));
		date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
	} while(date.getDay() != 0);
	return a;
};


/**
 * init the localStorage object
 * here variable root is a global variable
 */
function init() {

	if(!localStorage[root]) {
		window.time_tracker = {
			"domains": {}
		};
		localStorage[root] = JSON.stringify(window.time_tracker);
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
 * @param {string} domain the url of a domain
 */
function starttimer(domain) {
	var obj = window.time_tracker;
	//if no domain, add it
	if(!obj[domainmap][domain]) {
		addDomains(domain);
	}
	var d = obj[domainmap][domain];
	//if started return
	if(d['start'])
		return;
	//set start the millisecond of now
	d['start'] = (new Date()).getTime();
	//persist the object
	localStorage[root] = JSON.stringify(obj);
}

/**
 * stop the timer, use the now millisecond - start millisecond,
 * and delete the start property.
 */
function stoptimer(domain) {
	var obj = window.time_tracker;
	var item = obj[domainmap][domain];
	if(!item.start)
		return;
	var now = new Date();
	//get the seconds
	var secs = Math.round((now.getTime() - item.start) / 1000.0);
	//delete start property
	delete item.start;
	if(secs < 0) {
		return;
	}
	//add the seconds to daily
	item["daily"][Date.date2str(now)] =
	item["daily"][Date.date2str(now)] ? item["daily"][Date.date2str(now)]+secs : secs;
	//add to the total timer
	item['totalTime'] += secs;
	//persist the object
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

/**
 * call the chrome api to check if the chrome is
 * in focus and get the last focused tab url(maybe
 * the top most). I stored this info to 
 * oldFocus focus
 * oldurl url
 * then i call the setstatus function 
 */
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
 * when this function is called, oldurl url oldFocus focus
 * has been setted on window and i use this function to 
 * control start or stop timer.
 */
function setstatus() {
	var obj = window.time_tracker;
	var ourl = window.oldurl,
	nurl = window.url,
	of = window.oldFocus,
	nf = window.focus;
	//if i just get the chrome to top most, start track nurl
	if(!of && nf) {
		starttimer(nurl);
		console.log('from unfocus to focus: ' + nurl + ' start at ' + new Date());
	}
	//if i close the chrome 
	else if(of && !nf && nurl) {
		stoptimer(nurl);
		console.log('ourl: ' + ourl + ' nurl: ' + nurl);
		console.log('from focus to unfocus: ' + ourl + ' stop at ' + new Date());
	}
	//if i change the url(by change tab or update tab) 
	else if(of && nf) {
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

//dubug mode use
// destory();
// init();
// chrome.tabs.getSelected(null, function(tab) {
// selectedWnd = tab.windowId;
// });
// setInterval(checkChromeActive, 1000);
// chrome.windows.onFocusChanged.addListener( function(winid) {
	// checkChromeActive();
// });