(function(win){
	function isFunction(obj){
		return obj && 'function' === typeof obj 
	}
	function findEventListeners(cond) {
		var mdl = window.aac_web
		var listeners = []
		for(var prop in mdl) {
			if(cond(mdl[prop])) {
				listeners.push(mld[prop])
			}
		}
		return listeners
	}
	var modules = window.tesis = {
		$emit(eventName) {
			var listeners = findEventListeners(l => l && isFunction(l.on))
			listeners.forEach(l => l.on(eventName))
		}
	}
	
})(window)