var LS = LS || {};
(function(g){
	/**
	 * Get object from localStorage
	 */
	function get(item) {
		if(!localStorage[item]) return null;
		return JSON.parse(localStorage[item]);
	}
	
	/**
	 * Set object in localStorage
	 */
	function set(item, data) {
		localStorage[item] = JSON.stringify(data);
	}
	
	function get_sync() {
		return get('hourglass_sync');
	}
	
	function set_sync(data) {
		set('hourglass_sync', data);
	}
	g.get_sync = get_sync;
	g.set_sync = set_sync;
	function get_unsync() {
		return get('hourglass_unsync');
	}
	function set_unsync(data) {
		set('hourglass_unsync', data);
	}
	g.get_unsync = get_unsync;
	g.set_unsync = set_unsync;
})(LS);