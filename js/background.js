url_prefix = 'http://hourglass.sinaapp.com/index.php/service/';
CKEY = 3215313563;

var CookieUtil = {
	get: function (name) {
		var cookieName = encodeURIComponent(name) + "=",
		cookieStart = document.cookie.indexOf(cookieName),
		cookieValue = null;
		if (cookieStart > -1){
			var cookieEnd = document.cookie.indexOf(";", cookieStart)
			if (cookieEnd == -1){
				cookieEnd = document.cookie.length;
			}
			cookieValue = decodeURIComponent(document.cookie.substring(cookieStart
			+ cookieName.length, cookieEnd));
		}
		return cookieValue;
	},
	set: function (name, value, expires, path, domain, secure) {
		var cookieText = encodeURIComponent(name) + "=" +
		encodeURIComponent(value);
		if (expires instanceof Date) {
			cookieText += "; expires=" + expires.toGMTString();
		}
		if (path) {
			cookieText += "; path=" + path;
		}
		if (domain) {
			cookieText += "; domain=" + domain;
		}
		if (secure) {
			cookieText += "; secure";
		}
		document.cookie = cookieText;
	},
	unset: function (name, path, domain, secure) {
		this.set(name, "", new Date(0), path, domain, secure);
	}
};
			
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
 	getGroup: function(group, json) {
		var gs = JSON.parse(localStorage.time_tracker_group);
		if(!json) return gs[group];
		var result = {};
		for(var i=0, n=gs[group].length; i<n; i++)
			result[gs[group][i]] = 1;
		return result;
	}
};

/**
 * convert a Date Object to a string date pattern
 * like xxxx-x-x
 * @param {Date} date
 * @return {string}
 */
Date.date2str = function(date) {
	var str = "";
	str+=date.getFullYear()+"-" + (date.getMonth()+1) + "-" + (100 + date.getDate()).toString().substring(1);
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
	/**
	 * @return {array} [{domain: 'domain1', time: 'total time'}]
	 */
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
	
	/**
	 * @param {string} 'total', 'today', 'yesterday', 
	 * 	'thisweek', 'lastweek'
	 * @see object Date static methods
	 */
	get: function(param, group) {
		if(param == 'total') return this.gettotal(group);
		var obj = JSON.parse(localStorage.time_tracker_ext);
		var list = [];
		//get the date list
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
		var list = this.get(param, group);
		return this.gettimeingroup(list);
	},
	/**
	 * This is a privat function used by gettotaltime
	 * @return {number} total time of the list
	 */
	gettimeingroup: function(list) {
		var total = 0;
		for(var i=0; i<list.length; i++) 
			total += list[i].time;
		return total;
	}
};
var Statistics2 = {
	/**
	 * @return {array} [{domain: 'domain1', time: 'total time'}]
	 */
	_gettotal: function(group, data) {
		var list = [];
		//if the group argument is not given,
		//list all the domains
		if(!group) {
			for(var o in data) {
				list.push({domain: o, time: data[o]['total']});
			}
		}
		//else if group argument is given, list the domains in group
		else {
			var dos = Group.getGroup(group);
			for(var i=0, n=dos.length; i<n; i++) {
				list.push({domain: dos[i], time: data[dos[i]] && data[dos[i]]['total'] || 0});
			}
		}
		return list;
	},
	
	get: function(param, group) {
		var sync = this._get(param, group, LS.get_sync()),
			unsync = this._get(param, group, LS.get_unsync());
		var list = [], map = {};
		for(var i=0, n=sync.length; i<n; i++) {
			map[sync[i].domain] = sync[i].time;
		}
		for(var i=0, n=unsync.length; i<n; i++) {
			map[unsync[i].domain] = (map[unsync[i].domain] || 0) + unsync[i].time;
		}
		for(var d in map) {
			list.push({domain: d, time: map[d]});
		}
		return list;
	},
	
	_get: function(param, group, data) {
		if(param == 'total') return this._gettotal(group, data);
		var list = [];
		//get the date list
		var dates = Date['get'+param]();
		
		var dos = group ? Group.getGroup(group, true) : data;
		for(var p in dos) {
			var total = 0;
			for(var i=0; i<dates.length; i++) {
				total += data[p] && data[p][dates[i]] || 0;
			}	
			list.push({domain: p, time: total});
		}
		
		return list;
	},
	gettotaltime: function(param, group) {
		var list = this.get(param, group);
		return this.gettimeingroup(list);
	},
	/**
	 * This is a privat function used by gettotaltime
	 * @return {number} total time of the list
	 */
	gettimeingroup: function(list) {
		var total = 0;
		for(var i=0; i<list.length; i++) 
			total += list[i].time;
		return total;
	},
	
	get_sync_timestamp: function() {
		var dos = LS.get_sync(), map = {};
		for(var url in dos) {
			map[url] = dos[url].modified;
		}
		return map;
	}
};

/**
 * init the localStorage object
 * here variable root is a global variable
 */
// function initDomainStorage() {
// 	
// }

/**
 * destory all the thing stored in 
 * localStorage
 */
function destory() {
	if(LS.get_unsync())
		LS.set_unsync({});
}

/**
 * add a new domain to the storage object
 * @param {string} domain
 */
function addDomains(domain) {
	var obj = LS.get_unsync();
	obj[domain] = {
		"total": 0.0
	};
	LS.set_unsync(obj);
	return obj;
}

/**
 * delete the domain in the object
 * @param {string} domain
 */
function removeDomain(domain) {
	var obj = LS.get_unsync();
	delete obj[domainmap][domain];
	LS.set_unsync(obj);
}

/**
 * start the counter for a domain, which put
 * a start property in the domain with a value
 * of millisecond right now.
 * @param {string} domain the url of a domain
 */
function starttimer(domain) {
	var obj = LS.get_unsync();
	//if no domain, add it
	if(!obj[domain]) {
		obj = addDomains(domain);
	}
	var d = obj[domain];
	//stop all timer then start this
	for(var dm in obj) {
		stoptimer(dm);
	}
	//set start the millisecond of now
	d['start'] = (new Date()).getTime();
	//persist the object
	LS.set_unsync(obj);
}

/**
 * stop the timer, use the now millisecond - start millisecond,
 * and delete the start property.
 */
function stoptimer(domain) {
	var obj = LS.get_unsync();
	var item = obj[domain];
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
	//console.log('stop timer at ' + domain + ' ' + new Date() + ' :' + secs / 10.0 + 's');
	//persist the object
	LS.set_unsync(obj);
}

function clearTime() {
	var obj = LS.get_unsync();
	for( var d in obj)
		obj[d] = {
			"totalTime": 0.0,
			"daily": {}
		};
	LS.set_unsync(obj);
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
	var obj = LS.get_unsync();
	for(var d in obj) {
		stoptimer(d);
	}
}
function deleteStart() {
	var obj = LS.get_unsync();
	for(var d in obj[domainmap]) {
		delete d.start;
	}
}

/**
 * when this function is called, oldurl url oldFocus focus
 * has been setted on window and i use this function to 
 * control start or stop timer.
 */
function setstatus() {
	var obj = LS.get_unsync();
	var ourl = window.oldurl,
	nurl = window.url,
	of = window.oldFocus,
	nf = window.focus;
	//if i just get the chrome to top most, start track nurl
	if(!of && nf && nurl) {
		starttimer(nurl);
		//console.log('from unfocus to focus: ' + nurl + ' start at ' + new Date());
	}
	//if i close the chrome 
	else if(of && !nf && nurl) {
		stoptimer(nurl);
		//console.log('ourl: ' + ourl + ' nurl: ' + nurl);
		//console.log('from focus to unfocus: ' + ourl + ' stop at ' + new Date());
	}
	//if i change the url(by change tab or update tab) 
	else if(of && nf) {
		if(ourl != nurl) {
			//console.log('change focus at ' + new Date());
			if(ourl) {
				stoptimer(ourl);
				//console.log('stop ' + ourl);
			}
			starttimer(nurl);
			//console.log('start ' + nurl);
		}
		else {
			stoptimer(ourl);
			starttimer(nurl);
		}
	}
}

/*
 * When login successfully, request the server to create
 * a session.
 */
function add_session() {
	$.getJSON(url_prefix + 'add_session.php?uid=' + uid + '&client=' + appkey, 
	function(data) {
		console.log(data);
	});
}

/*
 * send unsync data to server
 * load sync
 */
function sync_data(callback) {
	if(localStorage.login !== 'true') return;
	var unsync = LS.get_unsync();
	if(!unsync) LS.set_unsync({});
	var match = /access_token=([^&]+)/i.exec(CookieUtil.get('weibojs_'+CKEY));
	var access_token = match && match[1];
	$.post(url_prefix + 'sync_data', 
		{
			'uid': localStorage['UID'] || window.UID,
			'client_id': CKEY,
			'access_token': access_token,
			'unsync': JSON.stringify(unsync), 
			'sync': JSON.stringify(Statistics2.get_sync_timestamp())
		}, 
		function(data) {
			try {
				data = JSON.parse(data);
			} catch(e) {
				callback && callback(false);
				return;
			}
			if(!data.success) {
				console.log('failed in upload data: ' + data.msg);
				callback && callback(false);
				return false;
			}
			update_sync(data.data);
			LS.set_unsync({});
			localStorage.last_update = '' + new Date().getTime();
			callback && callback(true);
	}, "text");
}

function update_sync(data) {
	var sync = LS.get_sync();
	for(var url in data) {
		if(!sync[url] || sync[url].modified < data[url].modified) sync[url] = data[url];
	}
	LS.set_sync(sync);
	console.log('updated sync now!');
}

function init() {
	if(!LS.get_sync()) LS.set_sync({});
	if(!LS.get_unsync()) LS.set_unsync({});
}

function fireEvent(element,event){
	var evt = document.createEvent("HTMLEvents");
	evt.initEvent(event, true, true );
	return !element.dispatchEvent(evt);
}
