
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

function createtable(obj, param) {
	var tb = document.createElement("table");
	tb.id = 'data';
	tb.appendChild(createthead(['Domain', 'Time']));
	tb.appendChild(createtbody(obj, param));
	return tb;
}

function createthead(array) {
	var thead = document.createElement('thead');
	var tr = document.createElement('tr');
	tr.className = 'head';
	for(var i=0; i<array.length; i++) {
		var th = document.createElement('th');
		th.appendChild(document.createTextNode(array[i]))
		tr.appendChild(th);
	}
	thead.appendChild(tr);
	return thead;
}

function createtbody(obj, param) {
	var tb = document.createElement('tbody');
	for(o in obj[domainmap])
		tb.appendChild(createtr(obj[domainmap][o], o, param));
	var total = document.createElement('tr');
	total.innerHTML = '<td class="name">Total</td><td class="time">' + formattime(getTotal(obj, param)) + '</td>';
	tb.appendChild(total);
	return tb;
}

function getTotal(obj, param) {
	param = param || 'totalTime';
	var total = 0;
	for(d in obj.domains) 
		total += obj.domains[d][param];
	return total;
}
function createtr(obj, domain, param) {
	param = param || 'totalTime';
	var tr = document.createElement("tr");
	var td = document.createElement("td");
	td.className = 'name';
	td.appendChild(document.createTextNode(domain));
	tr.appendChild(td);
	td = document.createElement("td");
	td.className = 'time';
	td.appendChild(document.createTextNode(formattime(obj[param])));
	tr.appendChild(td);
	return tr;
}