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
Date.date2str = function(date) {
	var str = "";
	str+=date.getFullYear()+"-" + (date.getMonth() + 101).toString().substring(1) + "-" + (100 + date.getDate()).toString().substring(1);
	return str;
};
Date.str2date = function(str) {
	var date = new Date();
	var dates = str.split(" ");
	date.setFullYear(parseInt(dates[0]));
	date.setMonth(parseInt(dates[1])-1);
	date.setDate(parseInt(dates[2]));
	return date;
};
Date.getyesterday = function() {
	var date = new Date();
	date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
	return [Date.date2str(date)];
};
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
//group
var Group = {
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
 * get the domain from a url
 */
function getDomain(url) {
	var match = /([^:]+):\/\/([^\/]*)\/?(\S*)/i.exec(url);
	if(!match)
		return 'invalid url';
	if(/file/i.test(match[1]))
		return 'localfile';
	return match[2];
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
	if(!LS.get_group()) LS.set_group({});
}

function fireEvent(element,event){
	var evt = document.createEvent("HTMLEvents");
	evt.initEvent(event, true, true );
	return !element.dispatchEvent(evt);
}
