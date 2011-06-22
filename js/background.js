var root = 'time_tracker_ext';
var domainmap = "domains";

function createComparisonFunction(propertyName) {
	return function(object1, object2){
		var value1 = object1[propertyName];
		var value2 = object2[propertyName];
		if (value1 < value2){
			return 1;
		} else if (value1 > value2){
			return -1;
		} else {
			return 0;
		}
	};
}

/*
 * get a time format like xdxhxmxs
 */
function formattime(secs) {
	var t = secs2format(secs);
	var str = "";
	if(t.d > 0)
		str += t.d + 'd';
	if(t.h > 0)
		str += t.h + 'h';
	if(t.m > 0)
		str += t.m + 'm';
	if(t.s >= 0)
		str += t.s + 's';
	return str;
}

/**
 * reverse of formattime
 * from xdxhxmxs => xxx seconds
 * @param {string} ss the xdxhxmxs format time
 * @return {number} seconds
 */
function getSecFromFormat(ss) {
	var pattern = /(\d+d)?(\d+h)?(\d+m)?(\d+s)/,
	rights = [24*60*60, 60*60, 60, 1],
	secs = 0;
	var match = pattern.exec(ss);
	for(var i=1; i<5; i++)
		secs += match[i] != undefined ? parseInt(match[i])*rights[i-1] : 0;
	return secs;
}
function secs2format(secs) {
	secs = secs / 10;
	return {
		'd':parseInt(secs/60/24/60),
		'h':parseInt(secs/60 % (24*60) / 60),
		'm':parseInt(secs/60 % (60*24) % 60),
		's':parseInt(secs % 60)
	};
}
//group
var Group = {
	initGroup: function() {
		if(!localStorage.time_tracker_group)
			localStorage.time_tracker_group = JSON.stringify({});
	},
	getAllDomainGroups: function() {
		var obj = JSON.parse(localStorage.time_tracker_ext), group = JSON.parse(localStorage.time_tracker_group);
		var domains = {};
		for(var g in group)
			for(var i=0; i<group[g].length; i++) {
				if(!domains[group[g][i]]) domains[group[g][i]] = [g];
				else domains[group[g][i]].push(g);
			}
		for(var d in domains)
			domains[d].sort();
		return domains;
	},
	getGroupArray: function() {
		var group = JSON.parse(localStorage.time_tracker_group);
		var groups = [];
		for(var g in group)
			groups.push(g);
		groups.sort();
		return groups;
	},
	destoryGroup: function() {
		if(localStorage.time_tracker_group)
			localStorage.removeItem('time_tracker_group');
	},
	createGroup: function(name) {
		var gs = JSON.parse(localStorage.time_tracker_group);
		if(gs[name]) {
			console.log(name + ' has created.');
			return false;
		}
		gs[name] = [];
		localStorage.time_tracker_group = JSON.stringify(gs);
		console.log('create group ' + name);
		return true;
	},
	addDomainToGroup: function(domain, group) {
		var gs = JSON.parse(localStorage.time_tracker_group);
		if(Group.isDomainInGroup(domain, group)) return false;
		gs[group].push(domain);
		localStorage.time_tracker_group = JSON.stringify(gs);
		console.log('add ' + domain + ' to group ' + group);
		return true;	
	},
	deleteGroup: function(group) {
		var gs = JSON.parse(localStorage.time_tracker_group);
		delete gs[group];
		localStorage.time_tracker_group = JSON.stringify(gs);
		console.log('delete group ' + group);
	}, 
	renameGroup: function(oldname, newname) {
		var gs = JSON.parse(localStorage.time_tracker_group);
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
	},
	deleteDomainFromGroup: function(domain, group){
		var gs = JSON.parse(localStorage.time_tracker_group);
		for(var i=0; i<gs[group].length; i++) {
			if(gs[group][i] == domain) {
				gs[group].splice(i, 1);
				console.log('delete ' + domain + ' in group ' + group);
				break;
			}
		}
		localStorage.time_tracker_group = JSON.stringify(gs);
	},
	isDomainInGroup: function(domain, group) {
		var gs = JSON.parse(localStorage.time_tracker_group);
		for(var i=0; i<gs[group].length; i++)
			if(gs[group][i] == domain) {
				console.log('domain ' + domain + ' is already in ' + group);
				return true;
			}
		return false;
	},
	getDomainGroups: function (domain) {
		var group = [], gs = JSON.parse(localStorage.time_tracker_group);
		for(var g in gs) {
			for(var i=0; i<gs[g].length; i++)
				if(domain == gs[g][i])
					group.push(g);
		}
		return group;
	},
 getGroup: function(group) {
		var gs = JSON.parse(localStorage.time_tracker_group);
		return gs[group];
	}
};
/*
function getAllDomainGroups() {
	var obj = JSON.parse(localStorage.time_tracker_ext), group = JSON.parse(localStorage.time_tracker_group);
	var domains = {};
	for(var g in group)
		for(var i=0; i<group[g].length; i++) {
			if(!domains[group[g][i]]) domains[group[g][i]] = [g];
			else domains[group[g][i]].push(g);
		}
	for(var d in domains)
		domains[d].sort();
	return domains;
}
function getGroupArray() {
	var group = JSON.parse(localStorage.time_tracker_group);
	var groups = [];
	for(var g in group)
		groups.push(g);
	groups.sort();
	return groups;
}
function destoryGroup() {
	if(localStorage.time_tracker_group)
		localStorage.removeItem('time_tracker_group');
}
function initGroup() {
	if(!localStorage.time_tracker_group)
		localStorage.time_tracker_group = JSON.stringify({});
}

function createGroup(name) {
	var gs = JSON.parse(localStorage.time_tracker_group);
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
	var gs = JSON.parse(localStorage.time_tracker_group);
	if(isDomainInGroup(domain, group)) return false;
	gs[group].push(domain);
	localStorage.time_tracker_group = JSON.stringify(gs);
	console.log('add ' + domain + ' to group ' + group);
	return true;	
}

function deleteGroup(group) {
	var gs = JSON.parse(localStorage.time_tracker_group);
	delete gs[group];
	localStorage.time_tracker_group = JSON.stringify(gs);
	console.log('delete group ' + group);
}

function renameGroup(oldname, newname) {
	var gs = JSON.parse(localStorage.time_tracker_group);
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
	var gs = JSON.parse(localStorage.time_tracker_group);
	for(var i=0; i<gs[group].length; i++) {
		if(gs[group][i] == domain) {
			gs[group].splice(i, 1);
			console.log('delete ' + domain + ' in group ' + group);
			break;
		}
	}
	localStorage.time_tracker_group = JSON.stringify(gs);
}

function isDomainInGroup(domain, group) {
	var gs = JSON.parse(localStorage.time_tracker_group);
	for(var i=0; i<gs[group].length; i++)
		if(gs[group][i] == domain) {
			console.log('domain ' + domain + ' is already in ' + group);
			return true;
		}
	return false;
}
function getDomainGroups(domain) {
	var group = [], gs = JSON.parse(localStorage.time_tracker_group);
	for(var g in gs) {
		for(var i=0; i<gs[g].length; i++)
			if(domain == gs[g][i])
				group.push(g);
	}
	return group;
}
function getGroup(group) {
	var gs = JSON.parse(localStorage.time_tracker_group);
	return gs[group];
}
*/
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
 * @return {array} xxxx-x-x pattern
 */
Date.getyesterday = function() {
	var date = new Date();
	date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
	return [Date.date2str(date)];
};
/**
 * get the date of today
 * @return {array} xxxx-x-x pattern
 */
Date.gettoday = function() {
	return [Date.date2str(new Date())];
};
Date.getthisweek = function() {
	var a = [];
	var date = new Date();
	do {
		a.push(Date.date2str(date));
		date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
	} while(date.getDay() != 0);
	return a;
};
Date.getlastweek = function() {
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

var Statistics = {
	gettotal: function(group) {
		var obj = JSON.parse(localStorage.time_tracker_ext);
		var list = [];
		//if the group argument is not given,
		//list all the domains
		if(!group) {
			var dos = obj[domainmap];
			for(var o in dos) {
				list.push({domain: o, time: dos[o]['totalTime']});
			}
		}
		//else if group argument is given, list the domains in group
		else {
			var dos = Group.getGroup(group);
			for(var i in dos) {
				list.push({domain: dos[i], time: obj[domainmap][dos[i]]['totalTime']});
			}
		}
		return list;
	},
	
	get: function(param, group) {
		if(param == 'total') return Statistics.gettotal(group);
		var obj = JSON.parse(localStorage.time_tracker_ext);
		var list = [];
		var dates = Date['get'+param]();
		if(!group) {
			var dos = obj[domainmap];
			for(var p in dos) {
				var total = 0;
				for(var i=0; i<dates.length; i++)
					total += 
					obj[domainmap][p].daily[dates[i]] ? obj[domainmap][p].daily[dates[i]]:0;
				list.push({domain: p, time: total});
			}
		}
		else {
			var dos = Group.getGroup(group);
			for(var j in dos) {
				var total = 0;
				for(var i=0; i<dates.length; i++)
					total += 
					obj[domainmap][dos[j]].daily[dates[i]] ? obj[domainmap][dos[j]].daily[dates[i]]:0;
				list.push({domain: dos[j], time: total});
			}
		}
		return list;
	}, 
	gettotaltime: function(param, group) {
		var list = Statistics.get(param, group);
		return Statistics.gettimeingroup(list);
	},
	gettimeingroup: function(list) {
		var total = 0;
		for(var i=0; i<list.length; i++) 
			total += list[i].time;
		return total;
	}
};

/**
 * init the localStorage object
 * here variable root is a global variable
 */
function init() {
	if(!localStorage.time_tracker_ext) {
		var obj = {
			"domains": {}
		};
		localStorage.time_tracker_ext = JSON.stringify(obj);
	} 
}

/**
 * destory all the thing stored in 
 * localStorage
 */
function destory() {
	if(localStorage.time_tracker_ext)
		localStorage.removeItem('time_tracker_ext');
}

/**
 * add a new domain to the storage object
 * @param {string} domain
 */
function addDomains(domain) {
	var obj = JSON.parse(localStorage.time_tracker_ext);
	obj[domainmap][domain] = {
		"totalTime": 0.0,
		"daily": {}
	};
	localStorage[root] = JSON.stringify(obj);
	return obj;
}

/**
 * delete the domain in the object
 * @param {string} domain
 */
function removeDomain(domain) {
	var obj = JSON.parse(localStorage.time_tracker_ext);
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
	var obj = JSON.parse(localStorage.time_tracker_ext);
	//if no domain, add it
	if(!obj[domainmap][domain]) {
		obj = addDomains(domain);
	}
	var d = obj[domainmap][domain];
	//if started return
	if(d['start']) {
		stoptimer(domain);		
	}
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
	var obj = JSON.parse(localStorage.time_tracker_ext);
	var item = obj[domainmap][domain];
	if(!item.start)
		return;
	var now = new Date();
	//get the seconds
	var secs = Math.round((now.getTime() - item.start) / 100.0);
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
	localStorage.time_tracker_ext = JSON.stringify(obj);
}

function clearTime() {
	var obj = JSON.parse(localStorage.time_tracker_ext);
	for( var d in obj[domainmap])
		obj[domainmap][d] = {
			"totalTime": 0.0,
			"daily": {}
		};
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
function stopAll() {
	var obj = JSON.parse(localStorage.time_tracker_ext);
	for(var d in obj[domainmap]) {
		stoptimer(d);
	}
}

/**
 * when this function is called, oldurl url oldFocus focus
 * has been setted on window and i use this function to 
 * control start or stop timer.
 */
function setstatus() {
	var obj = JSON.parse(localStorage.time_tracker_ext);
	var ourl = window.oldurl,
	nurl = window.url,
	of = window.oldFocus,
	nf = window.focus;
	//if i just get the chrome to top most, start track nurl
	if(!of && nf && nurl) {
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
		else {
			stoptimer(ourl);
			starttimer(nurl);
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
