/**
 *  IoManager class
 * which is component for querying input and output like local storage
 *
 *  Created by Justin Ng on 2014-11-07.
 *  Copyright (c) 2014 __MyCompanyName__. All rights reserved.
 * 
 */
ig.module('plugins.io.io-manager')
.requires(
    'plugins.io.storage',
    'plugins.io.mouse',
    'plugins.io.keyboard',
    'plugins.io.gamepad',
    'plugins.io.multitouch',
    'plugins.io.multitouch-input',
    'plugins.io.gamepad-input',
    'plugins.io.fake-storage'
)
.defines(function() {
	IoManager = ig.Class.extend({
		version: "1.0.0",
		storage: null,
		localStorageSupport: false,
		mouse: null,
		keyboard: null,
		multitouch: null,
		gamepad: null,
		/**
		 * Input and Storage initializer
		 */
		init: function() {
			ig.multitouchInput = new ig.MultitouchInput();
			ig.gamepadInput = new ig.GamepadInput();
			this.unbindAll();
			this.initStorage();
			this.initMouse();
			this.initKeyboard();
			//this.initMultitouch();
			//this.initGamepad();
		},
		/*
		 * Initialization Functions
		 */
		unbindAll: function() {
			ig.input.unbindAll();
			ig.gamepadInput.unbindAll();
		},
		initStorage: function() {
			try {
				window.localStorage.setItem("test", "test");
				window.localStorage.removeItem("test");
				this.storage = new ig.Storage();
			} catch (e) {
				console.log("using fake storage")
				this.storage = new ig.FakeStorage();
			} 
		},
		initMouse: function() {
			this.mouse = new Mouse();
		},
		initKeyboard: function() {
			this.keyboard = new Keyboard();
		},
		initMultitouch: function() {
			this.multitouch = new Multitouch();
		},
		initGamepad: function() {
			this.gamepad = new Gamepad();
		},
		/*
		 * Input Query Functions
		 */
		press: function(key) {
			if (ig.input.pressed(key)) {
				//console.log("keyboard or mouse");
				return true;
			}
			if (this.gamepad && this.gamepad.press(key)) {
				//console.log("gamepad");
				return true;
			}
			return false;
		},
		held: function(key) {
			if (ig.input.state(key)) {
				return true;
			}
			if (this.gamepad && this.gamepad.state(key)) {
				//console.log("gamepad");
				return true;
			}
			return false;
		},
		release: function(key) {
			if (ig.input.released(key)) {
				return true;
			}
			if (this.gamepad && this.gamepad.released(key)) {
				//console.log("gamepad");
				return true;
			}
			return false;
		},
		getClickPos: function() {
			return this.mouse.getPos();
		},
		getLastClickPos:function()
		{
			return this.mouse.getLast();
		},
		getTouchesPos:function()
		{
			return this.multitouch.getTouchesPos();
		},
		checkOverlap:function(input,x,y,w,h)
		{
			if(input.x > x+w)
			{
				return false;
			}
			if(input.x < x)
			{
				return false;
			}
			if(input.y >y+h)
			{
				return false;
			}
			if(input.y < y)
			{
				return false;
			}
			return true ;
		},
		clear:function()
		{
			ig.multitouchInput.clear();
		},
		/*
		 * Storage Functions
		 */
		_supportsLocalStorage: function() {
			try {
				var test = "test";
				localStorage.setItem(test, test);
				localStorage.removeItem(test);
				this.localStorageSupport = 'localStorage' in window && window['localStorage'] !== null;
				return this.localStorageSupport;
			} catch(e) {
				return this.localStorageSupport;
			}
		},
		storageIsSet: function(key) {
			if ( typeof (this.storage.isSet) === "function" ) {
				return this.storage.isSet(key);
			}
			return null;
		},
		storageGet: function(key) {
			if ( typeof (this.storage.get) === "function" ) {
				return this.storage.get(key);
			}
			return null;
		},
		storageSet: function(key, string) {
			if ( typeof (this.storage.set) === "function" ) {
				return this.storage.set(key, string);
			}
			return null;
		},
		assert: function(tag, actualValue, testValue) {
			if (actualValue !== testValue) {
				throw "actualValue:" + actualValue + " not equal to testValue:" + testValue + " at " + tag;
			}
		}
	});
});
