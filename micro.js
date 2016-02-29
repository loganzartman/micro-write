var micro = {
	runonce: false,
	text: null,
	stats: null,
	status: null,
	infook: null,
	infobox: null,
	controls: null,
	stats0: null,
	zeroSet: false,
	dark: false,
	infoboxVisible: false,

	noreplace: false,
	replaceMap: {
		"--": "—"
	},

	load: function() {
		micro.text = document.getElementById("text");
		micro.stats = document.getElementById("stats");
		micro.status = document.getElementById("status");
		micro.infobox = document.getElementById("infobox");
		micro.infook = document.getElementById("infook");
		micro.controls = document.getElementById("controls");
		micro.stxt = micro.status.innerHTML;
		micro.text.addEventListener("keyup", micro.evt.keypress, false);
		document.addEventListener("mouseup", micro.evt.mouseup, false);
		micro.text.addEventListener("blur", micro.evt.blur, false);
		micro.status.addEventListener("click", micro.evt.infobox, false);
		micro.infook.addEventListener("click", micro.evt.infobox, false);
		micro.stats.addEventListener("click", micro.evt.sclick, false);
		micro.stats.addEventListener("dblclick", micro.evt.sdclick, false);
		micro.controls.children[0].addEventListener("click", micro.evt.bright, false);
		micro.controls.children[1].addEventListener("click", micro.evt.spellcheck, false);
		micro.recall();
		if (!micro.runonce) micro.evt.infobox(null);
		if (!micro.zeroSet) micro.evt.sdclick();
		micro.writeStats();
		micro.evt.blur();

		//tempfix for ff/ie
		if (micro.text.offsetHeight < window.innerHeight/2) {
			micro.text.style.height = (window.innerHeight-micro.text.offsetTop-container.offsetTop)+"px";
		}
	},

	recall: function() {
		var runonce = localStorage.getItem("runonce");
		micro.runonce = runonce===null?false:true;
		var text = localStorage.getItem("text");
		micro.text.value = text===null?"":text;
		var zeroSet = localStorage.getItem("zeroSet");
		micro.zeroSet = zeroSet===null?false:zeroSet==="true";
		var dark = localStorage.getItem("dark");
		micro.dark = dark===null?false:dark==="true";
		if (dark) micro.evt.bright(false);

		if (localStorage.getItem("spellcheck") == "false") {
			micro.evt.spellcheck({target: micro.controls.children[1]});
		}

		if (micro.zeroSet) {
			var stats0 = localStorage.getItem("stats0");
			micro.stats0 = stats0===null?null:JSON.parse(stats0);
		}
	},

	store: function() {
		localStorage.setItem("text", micro.text.value);
		localStorage.setItem("zeroSet", micro.zeroSet);
		localStorage.setItem("dark", micro.dark);
		localStorage.setItem("stats0", JSON.stringify(micro.stats0));
		localStorage.setItem("spellcheck", micro.text.getAttribute("spellcheck"));
	},

	count: function(text, regex) {
		var match = text.match(regex);
		return match === null ? 0 : match.length;
	},

	getStats: function(text) {
		return {
			words: micro.count(text, micro.pattern.words),
			chars: text.length,
			sentences: micro.count(text, micro.pattern.sentences)
		};
	},

	getText: function() {
		var slice = micro.text.value;
		if (micro.text.selectionStart !== micro.text.selectionEnd)
			slice = slice.substring(micro.text.selectionStart,micro.text.selectionEnd);
		return slice;
	},

	writeStats: function() {
		var stats = micro.getStats(micro.getText());
		micro.stats.innerHTML = (stats.words-micro.stats0.words)+"w"+"\t"
		                       +(stats.chars-micro.stats0.chars)+"c"+"\t"
		                       +(stats.sentences-micro.stats0.sentences)+"s";
		if (micro.zeroSet) micro.status.innerHTML = "Δ"+micro.stxt;
	},

	pattern: {
		words: /\b[\w’'-]+\b/g,
		sentences: /[^.!?]+[.!?]\s|$/g
	},

	evt: {
		keypress: function(event) {
			micro.store();
			micro.writeStats();
		},

		mouseup: function(event) {
			setTimeout(micro.writeStats, 0);
		},

		blur: function(event) {
			micro.text.focus();
		},

		sclick: function(event) {
			micro.zeroSet = true;
			micro.stats0 = micro.getStats(micro.getText());
			micro.evt.keypress();
		},

		sdclick: function(event) {
			micro.zeroSet = false;
			micro.status.innerHTML = micro.stxt;
			micro.stats0 = micro.getStats("");
			micro.evt.keypress();
		},

		bright: function(event) {
			if (event) {
				micro.dark = !(micro.dark);
				micro.store();
			}
			var d = micro.dark?"dark":"bright";
			micro.text.className = d;
			document.documentElement.className = d;
			d = "bubble "+(micro.dark?"bubble-dark":"");
			micro.stats.className = d;
			micro.controls.className = d;
			micro.status.className = d;
		},

		spellcheck: function(event) {
			if (micro.text.getAttribute("spellcheck") != "false") {
				event.target.innerHTML = "sp ✗";
				micro.text.setAttribute("spellcheck", false);
			}
			else {
				event.target.innerHTML = "sp ✓";
				micro.text.setAttribute("spellcheck", true);
			}
			micro.store();
		},

		infobox: function(event) {
			if (event && event.target === micro.infook) localStorage.setItem("runonce", true);
			micro.infobox.style.visibility = micro.infoboxVisible?"hidden":"visible";
			micro.infobox.style.opacity = micro.infoboxVisible?"0.0":"1.0";
			micro.infoboxVisible = !micro.infoboxVisible;
		}
	}
};

window.addEventListener("load", micro.load, false);