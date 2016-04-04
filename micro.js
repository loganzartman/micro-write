var micro = {
	VERSION: 1004,
	runonce: false,
	loaded: false,
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
	caughtUp: false,
	syncFail: false,
	keyPressed: false,
	_tbuf: "",
	_lastInfoSet: 0,
	_infoHideTime: 0,

	noreplace: false,
	replaceMap: {
		"--": "—"
	},

	load: function() {
		micro.text = document.getElementById("text");
		micro.text.disabled = true;
		micro.stats = document.getElementById("stats");
		micro.status = document.getElementById("status");
		micro.info = document.getElementById("info");
		micro.infobox = document.getElementById("infobox");
		micro.infook = document.getElementById("infook");
		micro.controls = document.getElementById("controls");
		document.getElementById("vid").innerHTML = "v"+micro.VERSION;
		micro.stxt = micro.status.innerHTML;
		micro.text.addEventListener("keydown", micro.evt.keydown, false);
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

		setInterval(micro.evt.checkSync, 1500);
		setInterval(function(){
			micro._infoHideTime = Math.max(0, micro._infoHideTime - 1);
			if (micro._infoHideTime > 0) {
				micro.info.style.visibility = "hidden";
			}
			else {
				micro.info.style.visibility = "visible";
			}
		},200);

		//tempfix for ff/ie
		if (micro.text.offsetHeight < window.innerHeight/2) {
			micro.text.style.height = (window.innerHeight-micro.text.offsetTop-container.offsetTop)+"px";
		}
		micro.loaded = true;
		DS.handleClientLoad();
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

		micro.localModifyTime = localStorage.getItem("localModifyTime");

		if (localStorage.getItem("spellcheck") == "false") {
			micro.evt.spellcheck({target: micro.controls.children[1]});
		}

		if (micro.zeroSet) {
			var stats0 = localStorage.getItem("stats0");
			micro.stats0 = stats0===null?null:JSON.parse(stats0);
		}
	},

	store: function() {
		if (!micro.caughtUp) return;
		localStorage.setItem("text", micro.text.value);
		localStorage.setItem("zeroSet", micro.zeroSet);
		localStorage.setItem("dark", micro.dark);
		localStorage.setItem("stats0", JSON.stringify(micro.stats0));
		localStorage.setItem("spellcheck", micro.text.getAttribute("spellcheck"));
		micro.localModifyTime = new Date();
		localStorage.setItem("localModifyTime", micro.localModifyTime);
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

	setText: function(str) {
		micro.text.value = str;
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
		keydown: function(event) {
			if (event.keyCode === 9) {
				event.preventDefault();
				document.execCommand("insertText", false, "\t");
			}
		},

		keypress: function(event) {
			if (micro.caughtUp) micro.store();
			micro._infoHideTime = 5;
			micro.keyPressed = true;
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
			document.getElementById("occ").className = d;
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
		},

		authStatus: function(status) {
			if (status) {
				micro.text.enabled = true;
			}
			else {
				micro.syncFail = true;
				micro.text.enabled = false;
			}
		},

		catchUp: function() {
			micro.caughtUp = true;
			micro.text.disabled = false;
			micro.text.focus();
		},

		readyStatus: function(status) {
			if (status) {
				micro.pull();
			}
		},

		checkSync: function() {
			if (!micro.syncFail && micro.keyPressed) {
				if (micro._tbuf !== micro.text.value) {
					micro._tbuf = micro.text.value;
					micro.push();
					micro.keyPressed = false;
				}
			}
		}
	},

	setInfo: function(str) {
		if (Date.now() - micro._lastInfoSet < 200) return;
		micro._lastInfoSet = Date.now();
		micro.info.innerHTML = str;
	},

	pull: function() {
		if (!DS.ready) return false;
		micro.setInfo("loading...");
		if (DS.authorized) {
			DS.getDataFile(function(file){
				if (file) {
					var localModifyTime = new Date(micro.localModifyTime);
					DS.getDataContents(function(data){
						if (data && (typeof data.text !== "undefined")) {
							micro.evt.catchUp();
							var remoteModifyTime = new Date(data.remoteModifyTime);
							micro.syncFail = false;
							if (data.b64) data.text = Base64.decode(data.text);
							if (remoteModifyTime - localModifyTime > 0 || data.text === localStorage.getItem("text")) {
								micro.setInfo("loaded remotely");
								micro.setText(data.text);
							}
							else {
								micro.setInfo("sync conflict!");
								micro.setText(
									"CONFLICT: Local data newer than remote.\r\n" +
									"You might have left quickly or disconnected.  Just remove whatever data you don't need.\r\n...\r\n\r\n" +
									"[LOCAL Data from "+localModifyTime+"]\r\n" + localStorage.getItem("text") + "\r\n\r\n[REMOTE Data from "+remoteModifyTime+"]\r\n" + data.text
								);
							}
						}
						else {
							micro.setInfo("loaded locally");
						}
					});

				}
				else {
					micro.setInfo("retrying remote load");
					micro.syncFail = true;
					setTimeout(function(){
						micro.pull();
					}, 2000);
				}
			});
		}
		else {
			micro.evt.catchUp();
			micro.setInfo("loaded locally");
			micro.recall();
		}
	},

	push: function() {
		if (!DS.ready || !micro.caughtUp) return false;
		micro.setInfo("saving...");
		if (DS.authorized) {
			DS.getDataFile(function(file){
				if (file) {
					DS.updateDataFile({
						"b64": true,
						"text": Base64.encode(micro.text.value),
						"remoteModifyTime": new Date()
					}, function(resp){
						micro.setInfo("saved remotely");
						micro.syncFail = false;
					});
				}
				else {
					micro.setInfo("retrying remote save");
					micro.syncFail = true;
					setTimeout(function(){
						micro.push();
					}, 2000);
				}
			});
		}
		else {
			micro.setInfo("saved locally");
			micro.store();
		}
	}
};

window.addEventListener("load", micro.load, false);
