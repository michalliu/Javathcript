var WorkQueue = (function() {
	
	function WorkQueue() {
		this.ready = true;
		this.queue = [];
	}
	
	WorkQueue.prototype.add = function add(job) {
		this.queue.push(job);
		if (this.ready) {
			this.startWork();
		}
	};
	
	WorkQueue.prototype.startWork = function startWork() {
		if (this.queue.length < 1 || this.ready == false) {
			return;
		}
		this.ready = false;
		var workQueue = this;
		function done() {
			workQueue.ready = true;
			workQueue.startWork();
		}
		setTimeout(function() {
			var job = workQueue.queue.shift();
			job(done);
		}, 0);
	};
	
	return new WorkQueue();
})();

function evalFileJob(src) {
	return function(done) {
		var req = new XMLHttpRequest();
		req.open('GET', src, true);
		req.onreadystatechange = function (aEvt) {
			if (req.readyState == 4 && req.status == 200) {
				Javathcript.evalMulti(req.responseText);
				done();
			}
		};
		req.send(null);
	};
}

function evalScriptTagJob(txt) {
	return function(done) {
		Javathcript.evalMulti(txt);
		done();
	};
};

window.addEventListener("DOMContentLoaded", function() {
	var scripts = document.getElementsByTagName("script");
	for (var i = 0; i < scripts.length; ++i) {
		var script = scripts[i];
		if (script.getAttribute("type") == "text/lisp") {
			var src = script.getAttribute("src");
			if (src != null) {
				WorkQueue.add(evalFileJob(src));
			} else {
				WorkQueue.add(evalScriptTagJob(script.text));
			}
		} 
	} 
}, false);