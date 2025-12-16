/*
* Jason Low gamepad input ported to this framework by Justin Ng
*/
ig.module(
	'plugins.io.gamepad-input'
)
.requires(
)
.defines(function(){"use strict";


	ig.PADKEY={
		/**
		* Represents the button 0 (the A on the XBOX controller, the O on the OUYA controller)
		*/
		'BUTTON_0': 0,
		/**
		* Represents the button 1 (the B on the XBOX controller, the A on the OUYA controller)
		*/
		'PADBUTTON_1': 1,
		/**
		* Represents the button 2 (the X on the XBOX controller, the U on the OUYA controller)
		*/
		'BUTTON_2': 2,
		/**
		* Represents the button 3 (the Y on the XBOX controller, the Y on the OUYA controller)
		*/
		'BUTTON_3': 3,
		/**
		* Represents the left bumper button.
		*/
		'BUTTON_LEFT_BUMPER': 4,
		/**
		* Represents the right bumper button.
		*/
		'BUTTON_RIGHT_BUMPER': 5,
		
		/**
		* Represents the left trigger button.
		*/
		'BUTTON_LEFT_TRIGGER': 6,
		/**
		* Represents the right trigger button.
		*/
		'BUTTON_RIGHT_TRIGGER': 7,
		
		/**
		* Represents the left joystick button.
		*/
		'BUTTON_LEFT_JOYSTICK': 10,
		/**
		* Represents the right joystick button.
		*/
		'BUTTON_RIGHT_JOYSTICK': 11,
		/**
		* Represents the dpad up button.
		*/
		'BUTTON_DPAD_UP': 12,
		/**
		* Represents the dpad down button.
		*/
		'BUTTON_DPAD_DOWN': 13,
		/**
		* Represents the dpad left button.
		*/
		'BUTTON_DPAD_LEFT': 14,
		/**
		* Represents the dpad right button.
		*/
		'BUTTON_DPAD_RIGHT': 15,
		/**
		* Represents the menu button.
		*/
		'BUTTON_MENU': 16,
		
		/**
		* Represents the left joystick horizontal axis.
		*/
		'AXIS_LEFT_JOYSTICK_X': 0,
		/**
		* Represents the left joystick vertical axis.
		*/
		'AXIS_LEFT_JOYSTICK_Y': 1,
		/**
		* Represents the right joystick horizontal axis.
		*/
		'AXIS_RIGHT_JOYSTICK_X': 2,
		/**
		* Represents the right joystick vertical axis.
		*/
		'AXIS_RIGHT_JOYSTICK_Y': 3
	},

	ig.GamepadInput = ig.Class.extend({
		
		
		
		isInit:false,
		isSupported:false,
		list:[],
		bindings: {},
		
    	// Tracks buttons that are held down
    	// eg. ig.gamepad.state(action)
    	states: {},
    	
    	// Tracks buttons when they are initially pressed
    	// eg. ig.gamepad.pressed(action)
    	presses: {},
    	
    	// Tracks buttons when they are initially released
    	// eg. ig.gamepad.released(action)
    	releases: {},
    	
    	// Prevents pressed/held down buttons from triggering pressed(action) more than once
    	downLocks: {},
    	
    	// Prevents released buttons from triggering released(action) more than once
    	upLocks: {},
    	
    	// Relative positions of left and right thumbsticks between -1.0 and +1.0
    	leftStick: {x:0, y:0},
    	rightStick: {x:0, y:0},
		
		/**
		* Call ig.gamepadInput.start to start gamepad. You can check for support
		* with the isSupported variable
		*/
		start:function()
		{
	        if( this.isInit ) { return; }
	        this.isInit = true;

	        var systemSupportsGamepads = navigator.getGamepads || navigator.webkitGetGamepads;

	        if (systemSupportsGamepads)
	        {
	            if (!navigator.getGamepads)
	            {
	                if (navigator.webkitGetGamepads)
	                {
	                    navigator.getGamepads = navigator.webkitGetGamepads;
	                }
	            }

	            this.list = navigator.getGamepads();
	        }

	        this.isSupported = systemSupportsGamepads;
		},
		
		isAvailable:function()
		{
			return this.isInit && this.isSupported;
		},
		
	    // Based on user agent, implementations of HTML5 Gamepad button may differ
	    buttonPressed: function(b) {
	        if (typeof(b) == "object") {
	            return b.pressed;
	        }
	        return b == 1.0;
	    },

	    buttonDown: function(code){
	        var action = this.bindings[code];
	        if( action ) {
	            this.states[action] = true;
	            if( !this.downLocks[action] ) {
	                this.presses[action] = true;
	                this.downLocks[action] = true;
	            }
	        }
	    },

	    buttonUp: function(code){
	        var action = this.bindings[code];
	        if( action ) {
	            // prevent release when pressed hasn't happened yet
	            if(this.downLocks[action]){
	                if(!this.upLocks[action]){
	                    this.states[action] = false;
	                    this.releases[action] = true;
	                    this.upLocks[action] = true;
	                }
	            }
	        }
	    },
		
	    // clears pressed and released flags
	    // can be called separately from game loop to cancel/reset actions
	    clearPressed: function() {
	        for( var action in this.releases ) {
	            this.states[action] = false;
	            this.downLocks[action] = false;
	        }
	        this.releases = {};
	        this.presses = {};
	        this.upLocks = {};
	    },
		
	    bind: function( code, action ) {
	        this.bindings[code] = action;
	    },
		unbind:function(code)
		{
	        var action = this.bindings[code];
	        this.releases[action] = true;
	        this.bindings[code] = null;
		},
	    unbindAll: function() 
		{
	        this.bindings = {};
	        this.states = {};
	        this.presses = {};
	        this.releases = {};
	        this.downLocks = {};
	        this.upLocks = {};
	    },
		
	    state: function( action ) {
	        return this.states[action];
	    },

	    pressed: function( action ) {
	        return this.presses[action];
	    },

	    released: function( action ) {
	        return this.releases[action];
	    },

	    clamp: function(num, min, max) {
	        return num < min ? min : (num > max ? max : num);
	    },
		
	    // Polls gamepads for thumbsticks and button states
	    pollGamepads: function(){
	        if(!this.isSupported){
	        	return;
	        } 

	        this.leftStick.x  = 0;
	        this.leftStick.y  = 0;
	        this.rightStick.x = 0;
	        this.rightStick.y = 0;

	        this.list = navigator.getGamepads();

	        // only look at buttons which are bound
	        for (var code in this.bindings){
	            var atLeastOnePressed = false;

	            for (var i = 0; i < this.list.length; i++){
	                var gamepad = this.list[i];
	                if(!gamepad || !gamepad.buttons) continue;

	                var pressed = this.buttonPressed(gamepad.buttons[code]);
	                if(pressed){
	                    atLeastOnePressed = true;
	                    break;
	                }
	            }
	            if(atLeastOnePressed) {
	                this.buttonDown(code);
	            }else{
	                this.buttonUp(code);
	            }
	        }
	        // sum all thumbstick inputs
	        for (var i = 0; i < this.list.length; i++){
	            var gamepad = this.list[i];
	            if(!gamepad || !gamepad.axes) continue;

	            var leftJoystickX  = gamepad.axes[ig.GAMEPADINPUT.AXIS_LEFT_JOYSTICK_X];
	            var leftJoystickY  = gamepad.axes[ig.GAMEPADINPUT.AXIS_LEFT_JOYSTICK_Y];
	            var rightJoystickX = gamepad.axes[ig.GAMEPADINPUT.AXIS_RIGHT_JOYSTICK_X];
	            var rightJoystickY = gamepad.axes[ig.GAMEPADINPUT.AXIS_RIGHT_JOYSTICK_Y];

	            this.leftStick.x  += isNaN(leftJoystickX)?0:leftJoystickX;
	            this.leftStick.y  += isNaN(leftJoystickY)?0:leftJoystickY;
	            this.rightStick.x += isNaN(rightJoystickX)?0:rightJoystickX;
	            this.rightStick.y += isNaN(rightJoystickY)?0:rightJoystickY;
	        }
	        // clamp thumstick inputs
	        if(this.list.length > 0){
	            this.leftStick.x  = this.clamp(this.leftStick.x,  -1, 1);
	            this.leftStick.y  = this.clamp(this.leftStick.y,  -1, 1);
	            this.rightStick.x = this.clamp(this.rightStick.x, -1, 1);
	            this.rightStick.y = this.clamp(this.rightStick.y, -1, 1);
	        }
	    },
	});
});