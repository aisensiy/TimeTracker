url_prefix = 'http://hourglass.sinaapp.com/index.php/service/';
CKEY = 3215313563;



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

var currentDomain = null;
var startTime = null;
var currentTabId = null;
var updateCounterInterval = 10 * 1000;
var lastActivitySeconds = 0;
function checkIdleTime(seconds) {
	//console.log('Checking idle time.');
	lastActivitySeconds += 10;
	//console.log('Last activity was ' + lastActivitySeconds + ' seconds ago.');
	if(localStorage['pause'] == 'false' && lastActivitySeconds > 60) 
		pause();
}
function pause() {
	localStorage['pause'] = 'true';
}
function resume() {
	localStorage['pause'] = 'false';
}
function resetActivity() {
	lastActivitySeconds = 0;
	if(localStorage['pause'] == 'true')
		resume();
}
function updateCounter() {
	if(localStorage['pause'] == 'true') {
		currentDomain = null;
		return;
	}
	if(currentTabId == null) return;
	chrome.tabs.get(currentTabId, function(tab){
		tab && chrome.windows.get(tab.windowId, function(window){
			//If the window is not topmost, don't update counter
			if(window && !window.focused) return;
			var domain = getDomain(tab.url);
			//If the domain is invalid, don't update counter
			if(domain == null) {
				//console.log('Unable to update counter with url: ' + tab.url);
				return;
			}
			//We can't update the counter when the global currentDomain is null,
			//and we set the domain to current, and the startTime is always 
			//update together with currentDomain
			if(currentDomain == null) {
				currentDomain = domain;
				startTime = new Date();
				//console.log('start timer for: ' + currentDomain);
				return;
			}
			var delta = new Date().getTime() - startTime.getTime();
			if(delta < updateCounterInterval * 100) {
				updateTime(currentDomain, Math.round(delta / 1000));
				//console.log("End timer for: " + currentDomain + ' start timer for: ' + domain);
			}
			else {
				console.log('It is a invalid update for its too big.');
			}
			currentDomain = domain;
			startTime = new Date();
		});
	});
}
/**
 *update the time in the localStorage
 */
function updateTime(domain, seconds) {
	var obj = LS.get_unsync();
	var item = obj[domain];
	if(!item) {
		obj[domain] = {
"total": 0.0
};
		item = obj[domain];
	}
	var now = new Date();
	//add the seconds to daily
	item[Date.date2str(now)] =
	item[Date.date2str(now)] ? item[Date.date2str(now)]+seconds : seconds;
	//add to the total timer
	item['total'] += seconds;
	LS.set_unsync(obj);
}


function sae_login(callback) {
	if(!window.UID) return;
	var match = /access_token=([^&]+)/i.exec(CookieUtil.get('weibojs_'+CKEY));
	var access_token = match && match[1];
	$.getJSON(url_prefix + 'wb_sess', 
		{
			client_id: CKEY,
			access_token: access_token,
			uid: UID
		},
		function(data) {
			if(data.success) {
				console.log('create session successfully!');
				localStorage.login = 'true';
				chrome.extension.sendRequest({name: "login"});
				callback && callback();
			}
		}
	);
}
function make_widget() {
	$("#wb_connect_btn").html("");
	WB2.anyWhere(function(W) {
		W.widget.connectButton({
			id : "wb_connect_btn",
			callback : {
				login : function(o) {
					localStorage['UID'] = UID = o.id;
					sae_login();
					setTimeout(function() {chrome.extension.sendRequest({name: "login_pop"});}, 500);
				},
				logout : function() {
					localStorage.login = 'false';
					chrome.extension.sendRequest({name: "logout_pop"});
				}
			}
		});
	});
}
function initialize() {
	//if(WB2.checkLogin()) sea_login();
	//make_widget();
	//sae_login();
	
	init();
	localStorage['pause'] = 'false';
	
	chrome.extension.onRequest.addListener(function(request) {
		if(request.name === 'login_bg') {
			var elt = $('#wb_connect_btn div')[0];
			fireEvent(elt, 'click');
		} else if (request.name == 'logout_bg') {
			//var elt = $('#wb_connect_btn .weibo_widget_connect_disconnect')[0];
			WB2.logout();
			make_widget();
			chrome.extension.sendRequest({name: "logout_pop"});
			//fireEvent(elt, 'click');
		}
	});

	chrome.tabs.onSelectionChanged.addListener(function(tabid, seclectInfo){
		// console.log('Tab changed');
		resetActivity();
		currentTabId = tabid;
		updateCounter();
	});

	chrome.tabs.onUpdated.addListener(function(tabid, changeInfo, tab){
		if(currentTabId == tabid) {
			// console.log('tab update');
			updateCounter();
		}
	});

	chrome.windows.onFocusChanged.addListener(
		function(wndid) {
			if(wndid < 0) return;
			//console.log('Window focus changed');
			resetActivity();
			chrome.tabs.getSelected(wndid, function(tab){
				// console.log('Window/Tab changed');
				currentTabId = tab.id;
				updateCounter();
			});
		}
	);
	
	chrome.extension.onConnect.addListener(
		function(port) {
			console.assert(port.name == 'idle');
			port.onMessage.addListener(function(msg){
				// console.log('Move or Key down make activity reset');
				resetActivity();
			});
		}
	);
	
	window.setInterval(updateCounter, updateCounterInterval);			
	window.setInterval(checkIdleTime, 1000*10);
	/*
	window.setInterval(function() {
		if(+new Date() - +localStorage.last_update < 1000 * 60 * 60) return;
		sync_data();
	}, 1000 * 60 * 10);
	window.setInterval(function() {make_widget();}, 1000 * 60 * 5);
	*/
}

function stopTime() {
	if(currentDomain != null && startTime != null) {
		var delta = new Date().getTime() - startTime.getTime();
		updateTime(currentDomain, Math.round(delta / 1000));
		// console.log('stop timer for: ' + currentDomain);
		currentDomain = null;
		startTime = null;
		currentTabId = null;
	}
}

window.onload = initialize;