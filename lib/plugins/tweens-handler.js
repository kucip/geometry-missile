ig.module(
	'plugins.tweens-handler'
)
.requires(
	'impact.entity',
	'plugins.tween',
    "plugins.patches.entity-patch"
)
.defines(function() {
    /**
    *
    * var coords = { x: 0, y: 0 };
    * var tween = new ig.TweenDef(coords)
    * 	.to({ x: 100, y: 100 }, 1000)
    * 	.onUpdate(function() {
    * 		console.log(this.x, this.y);
    * })
    * .start();
    * 
    * requestAnimationFrame(animate);
    * 
    * function animate(time) {
    * 	requestAnimationFrame(animate);
    * 	ig.TweenDef.update(time);
    * }
    * 
    */
    
    
    if ( !Array.prototype.indexOf ) {
        Array.prototype.indexOf = function(el, start) {
            var start = start || 0;
            for ( var i=0; i < this.length; ++i ) {
                if ( this[i] === el ) {
                    return i;
                }
            }
            return -1;
        };
    };
    
    ig.TweensHandler = ig.Class.extend({
        _tweens:[],
        _systemPausedTweens:[],
        init:function(){
            
        },
        getAll:function(){
            return this._tweens;
        },
        removeAll: function(){
            this._tweens = [];
        },
        add: function (tween){
            this._tweens.push(tween);
        },
        remove: function (tween){
            var i = this._tweens.indexOf(tween);
            if (i !== -1){
                this._tweens.splice(i, 1);
            }
        },
        onSystemPause: function () {
            /* pause all tweens */
            if (this._tweens.length === 0) {
                return false;
            }
            
            var i = 0, tween = null;
            while (i < this._tweens.length) {
                tween = this._tweens[i];
                if( tween._isPlaying ) {
                    // register this tween to be resumed 
                    this._systemPausedTweens.push(tween);
                    tween.pause();
                }
                
                i++;
            }
            
            return true;
        },
        onSystemResume: function () {
            /* resume all tweens paused by system */
            if (this._systemPausedTweens.length === 0) {
                return false;
            }
            
            var i = 0;
            while (i < this._systemPausedTweens.length) {
                this._systemPausedTweens[i].resume();
                i++;
            }
            
            // clean up the array
            this._systemPausedTweens = [];
            
            return true;
        },
        update: function (time, preserve){
            if (this._tweens.length === 0) {
                return false;
            }
            var i = 0;
            
            time = time !== undefined ? time : ig.game.tweens.now();
            
            while (i < this._tweens.length) {
                
                if (this._tweens[i].update(time) || preserve) {
                    
                    i++;
                }
                else 
                {
                    this._tweens.splice(i, 1);
                }
            }
            
            return true;
        },
        now:function(){
            return Date.now();
        }
    });
    
    ig.TweenDef = ig.Class.extend({
        version: "1.0.1",
        _ent:null,
        
        _valuesStart : {},
        _valuesEnd : {},
        _valuesStartRepeat : {},
        _duration : 1000,
        _repeat : 0,
        //_repeatDelayTime,
        _yoyo : false,
        _isPlaying : false,
        _reversed : false,
        _delayTime : 0,
        _startTime : null,
        _pauseTime : null,
        _easingFunction : ig.Tween.Easing.Linear.EaseNone,
        _interpolationFunction : ig.Tween.Interpolation.Linear,
        _chainedTweens : [],
        _onStartCallback : null,
        _onStartCallbackFired : false,
        _onUpdateCallback : null,
        _onCompleteCallback : null,
        _onStopCallback : null,
        _onPauseCallback : null,
        _onResumeCallback : null,
        _currentElapsed:0,
        
        init:function(object){
            this._object=object;
        },

        to : function (properties, duration) {
            this._valuesEnd = properties;
            
            if (duration !== undefined) {
            	this._duration = duration;
            }
            return this;
        },

    	start : function (time) {
    		if (this._isPlaying) {
    			return this;
    		}

    		ig.game.tweens.add(this);
    		this._isPlaying = true;

    		this._onStartCallbackFired = false;

    		this._startTime = time !== undefined ? time : ig.game.tweens.now();
    		this._startTime += this._delayTime;

    		for (var property in this._valuesEnd) {

    			// Check if an Array was provided as property value
    			if (this._valuesEnd[property] instanceof Array) {

    				if (this._valuesEnd[property].length === 0) {
    					continue;
    				}

    				// Create a local copy of the Array with the start value at the front
    				this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);

    			}
                
    			// If `to()` specifies a property that doesn't exist in the source object,
    			// we should not set that property in the object
    			if (this._object[property] === undefined) {
    				
                    continue;
    			}

    			// Save the starting value.
    			this._valuesStart[property] = this._object[property];
    			if ((this._valuesStart[property] instanceof Array) === false) {
    				this._valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
    			}

    			this._valuesStartRepeat[property] = this._valuesStart[property] || 0;

    		}

    		return this;

    	},
        

    	stop : function () {

    		if (!this._isPlaying) {
    			return this;
    		}

    		ig.game.tweens.remove(this);
    		this._isPlaying = false;

    		if (this._onStopCallback !== null) {
    			this._onStopCallback.call(this._object, this._object);
    		}

    		this.stopChainedTweens();
    		return this;

    	},
        
        pause : function () {
            /* check if playing */
    		if (!this._isPlaying) {
    			return this;
    		}
            /* set paused flag to stop updating */
    		ig.game.tweens.remove(this);
    		this._isPlaying = false;
            
            /* keep track of where it stopped - paused timestamp */
            this._pauseTime = ig.game.tweens.now();
            
            /* callback function */
    		if (this._onPauseCallback !== null) {
    			this._onPauseCallback.call(this._object, this._object);
    		}
            
            return this;
        },
        
        resume : function () {
            /* check if paused */
    		if (this._isPlaying) {
    			return this;
    		}
            if (!this._pauseTime) {
                return this;
            }
            
            /* continue from last checkpoint - time elapsed */
            var compensation = ig.game.tweens.now() - this._pauseTime;
            this._startTime += compensation;
            
                        
            /* unset paused flag to continue updating */
    		ig.game.tweens.add(this);
    		this._isPlaying = true;		
            
            /* callback function */
    		if (this._onResumeCallback !== null) {
    			this._onResumeCallback.call(this._object, this._object);
    		}
            this._pauseTime = null;
            return this;
        },

    	end : function () {

    		this.update(this._startTime + this._duration);
    		return this;

    	},

    	stopChainedTweens : function () {

    		for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
    			this._chainedTweens[i].stop();
    		}

    	},

    	delay : function (amount) {

    		this._delayTime = amount;
    		return this;

    	},

    	repeat : function (times) {

    		this._repeat = times;
    		return this;

    	},

    	repeatDelay : function (amount) {

    		this._repeatDelayTime = amount;
    		return this;

    	},

    	yoyo : function (yoyo) {

    		this._yoyo = yoyo;
    		return this;

    	},


    	easing : function (easing) {

    		this._easingFunction = easing;
    		return this;

    	},

    	interpolation : function (interpolation) {

    		this._interpolationFunction = interpolation;
    		return this;

    	},

    	chain : function () {

    		this._chainedTweens = arguments;
    		return this;

    	},

    	onStart : function (callback) {

    		this._onStartCallback = callback;
    		return this;

    	},

    	onUpdate : function (callback) {

    		this._onUpdateCallback = callback;
    		return this;

    	},

    	onComplete : function (callback) {

    		this._onCompleteCallback = callback;
    		return this;

    	},

    	onStop : function (callback) {

    		this._onStopCallback = callback;
    		return this;

    	},
        
        onPause : function (callback) {
            
    		this._onPauseCallback = callback;
    		return this;
            
        },
        
        onResume: function (callback) {
            
    		this._onResumeCallback = callback;
    		return this;
            
        },

    	update : function (time) {
    		var property;
    		var elapsed;
    		var value;

    		if (time < this._startTime) {
    			return true;
    		}

    		if (this._onStartCallbackFired === false) {

    			if (this._onStartCallback !== null) {
    				this._onStartCallback.call(this._object, this._object);
    			}

    			this._onStartCallbackFired = true;
    		}

    		elapsed = (time - this._startTime) / this._duration;
    		elapsed = elapsed > 1 ? 1 : elapsed;
            
            this._currentElapsed = elapsed;
            
    		value = this._easingFunction(elapsed);

    		for (property in this._valuesEnd) {

    			// Don't update properties that do not exist in the source object
                
    			if (this._valuesStart[property] === undefined) {
    				continue;
    			}

    			var start = this._valuesStart[property] || 0;
    			var end = this._valuesEnd[property];
                
    			if (end instanceof Array) {
    				this._object[property] = this._interpolationFunction(end, value);

    			} else {

    				// Parses relative end values with start as base (e.g.: +10, -3)
    				if (typeof (end) === 'string') {

    					if (end.charAt(0) === '+' || end.charAt(0) === '-') {
    						end = start + parseFloat(end);
    					} else {
    						end = parseFloat(end);
    					}
    				}
    				// Protect against non numeric properties.
    				if (typeof (end) === "number") {
    					this._object[property] = start + (end - start) * value;
                        
    				}

    			}

    		}

    		if (this._onUpdateCallback !== null) {
    			this._onUpdateCallback.call(this._object, this._object, value);
    		}

    		if (elapsed === 1) {

    			if (this._repeat > 0) {

    				if (isFinite(this._repeat)) {
    					this._repeat--;
    				}

    				// Reassign starting values, restart by making startTime = now
    				for (property in this._valuesStartRepeat) {

    					if (typeof (this._valuesEnd[property]) === 'string') {
    						this._valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property]);
    					}

    					if (this._yoyo) {
    						var tmp = this._valuesStartRepeat[property];

    						this._valuesStartRepeat[property] = this._valuesEnd[property];
    						this._valuesEnd[property] = tmp;
    					}

    					this._valuesStart[property] = this._valuesStartRepeat[property];

    				}

    				if (this._yoyo) {
    					this._reversed = !this._reversed;
    				}

    				if (this._repeatDelayTime !== undefined) {
    					this._startTime = time + this._repeatDelayTime;
    				} else {
    					this._startTime = time + this._delayTime;
    				}

    				return true;

    			} else {
    				this._isPlaying = false;

    				if (this._onCompleteCallback !== null) {

    					this._onCompleteCallback.call(this._object, this._object);
    				}

    				for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
    					// Make the chained tweens start exactly at the time they should,
    					// even if the `update()` method was called way past the duration of the tween
    					this._chainedTweens[i].start(this._startTime + this._duration);
    				}

    				return false;

    			}

    		}

    		return true;

    	}
        
    });
    
    ig.Tween.Interpolation = {
    	Linear: function (v, k) {

    		var m = v.length - 1;
    		var f = m * k;
    		var i = Math.floor(f);
    		var fn = ig.Tween.Interpolation.Utils.Linear;

    		if (k < 0) {
    			return fn(v[0], v[1], f);
    		}

    		if (k > 1) {
    			return fn(v[m], v[m - 1], m - f);
    		}

    		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

    	},

    	Bezier: function (v, k) {

    		var b = 0;
    		var n = v.length - 1;
    		var pw = Math.pow;
    		var bn = ig.Tween.Interpolation.Utils.Bernstein;

    		for (var i = 0; i <= n; i++) {
    			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
    		}

    		return b;

    	},

    	CatmullRom: function (v, k) {

    		var m = v.length - 1;
    		var f = m * k;
    		var i = Math.floor(f);
    		var fn = ig.Tween.Interpolation.Utils.CatmullRom;

    		if (v[0] === v[m]) {

    			if (k < 0) {
    				i = Math.floor(f = m * (1 + k));
    			}

    			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

    		} else {

    			if (k < 0) {
    				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
    			}

    			if (k > 1) {
    				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
    			}

    			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

    		}

    	},

    	Utils: {

    		Linear: function (p0, p1, t) {

    			return (p1 - p0) * t + p0;

    		},

    		Bernstein: function (n, i) {

    			var fc = ig.Tween.Interpolation.Utils.Factorial;

    			return fc(n) / fc(i) / fc(n - i);

    		},

    		Factorial: (function () {

    			var a = [1];

    			return function (n) {

    				var s = 1;

    				if (a[n]) {
    					return a[n];
    				}

    				for (var i = n; i > 1; i--) {
    					s *= i;
    				}

    				a[n] = s;
    				return s;

    			};

    		})(),

    		CatmullRom: function (p0, p1, p2, p3, t) {

    			var v0 = (p2 - p0) * 0.5;
    			var v1 = (p3 - p1) * 0.5;
    			var t2 = t * t;
    			var t3 = t * t2;

    			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

    		}

    	}
    };
    
    /*
    ig.game.Tween = ig.Class.extend({
        
        init:function(object){
            
        },
        

        ig.TweenDef = function (object) {

        	

        };
    });

    ig.Entity.prototype.tween = function(props, duration, settings) {
    	var tween = new ig.Tween(this, props, duration, settings);
    	this.tweens.push(tween);
    	return tween;
    };
    
    ig.Entity.prototype.pauseTweens = function() {
    	for ( var i = 0; i < this.tweens.length; i++ ) {
    		this.tweens[i].pause();
    	}
    };
    
    ig.Entity.prototype.resumeTweens = function () {
    	for ( var i = 0; i < this.tweens.length; i++ ) {
    		this.tweens[i].resume();
    	}
    };
    
    ig.Entity.prototype.stopTweens = function(doComplete) {
    	for ( var i = 0; i < this.tweens.length; i++ ) {
    		this.tweens[i].stop(doComplete);
    	}
    };
    
    ig.Tween = function(obj, properties, duration, settings) {
    	var _object = obj;
    	var valuesStart = {};
    	var valuesEnd = {};
    	var valuesDelta = {};
    	var _elapsed = 0;
    	var timer = false;
    	var started = false;
    	var _props = properties;
    	var _chained = false;
    	this.duration = duration;
    	this.complete = false;
    	this.paused = false;
    	this.easing = ig.Tween.Easing.Linear.EaseNone;
    	this.onComplete = false;
    	this.delay = 0;
    	this.loop = 0;
    	this.loopCount = -1;
    	ig.merge(this, settings);
    	this.loopNum = this.loopCount;
    
    	this.chain = function(chainObj) {
    		_chained = chainObj;
    	};
    
    	this.initEnd = function(prop, from, to) {
    		if ( typeof(from[prop]) !== "object" ) {
    			to[prop] = from[prop];
    		} else {
    			for ( subprop in from[prop] ) {
    				if ( !to[prop] ) to[prop] = {};
    				this.initEnd( subprop, from[prop], to[prop] );
    			}
    		}
    	};
    
    	this.initStart = function(prop, end, from, to) {
    		if ( typeof(from[prop]) !== "object" ) {
    			if ( typeof(end[prop]) !== "undefined" ) to[prop] = from[prop];
    		} else {
    			for ( subprop in from[prop] ) {
    				if ( !to[prop] ) to[prop] = {};
    				if ( typeof(end[prop]) !== "undefined" ) this.initStart( subprop, end[prop], from[prop], to[prop] );
    			}
    		}
    	};
    
    	this.start = function() {
    		this.complete = false;
    		this.paused = false;
    		this.loopNum = this.loopCount;
    		_elapsed = 0;
    		if ( _object.tweens.indexOf(this) == -1 ) _object.tweens.push(this);
    		started = true;
    		timer = new ig.Timer();
    		for ( var property in _props ) {
    			this.initEnd(property, _props, valuesEnd);
    		}
    		for ( var property in valuesEnd ) {
    			this.initStart(property, valuesEnd, _object, valuesStart);
    			this.initDelta(property, valuesDelta, _object, valuesEnd);
    		}
    	};
    
    	this.initDelta = function(prop, delta, start, end) {
    		if ( typeof(end[prop]) !== "object" ) {
    			delta[prop] = end[prop] - start[prop];
    		} else {
    			for ( subprop in end[prop] ) {
    				if ( !delta[prop] ) delta[prop] = {};
    				this.initDelta(subprop, delta[prop], start[prop], end[prop]);
    			}
    		}
    	};
    
    	this.propUpdate = function(prop, obj, start, delta, value) {
    		if ( typeof(start[prop]) !== "object" ) {
    			if ( typeof start[prop] != "undefined" ) {
    				obj[prop] = start[prop] + delta[prop] * value;
    			} else {
    				obj[prop] = obj[prop];
    			}
    		} else {
    			for ( subprop in start[prop] ) {
    				this.propUpdate(subprop, obj[prop], start[prop], delta[prop], value);
    			}
    		}
    	};
    
    	this.propSet = function(prop, from, to) {
    		if ( typeof(from[prop]) !== "object" ) {
    			to[prop] = from[prop];
    		} else {
    			for ( subprop in from[prop] ) {
    				if ( !to[prop] ) to[prop] = {};
    				this.propSet( subprop, from[prop], to[prop] );
    			}
    		}
    	};
    
    	this.update = function() {
    		if ( !started ) return false;
    		if ( this.delay ) {
    			if ( timer.delta() < this.delay ) return;
    			this.delay = 0;
    			timer.reset();
    		}
    		if ( this.paused || this.complete ) return false;
    
    		var elapsed = (timer.delta() + _elapsed) / this.duration;
    		elapsed = elapsed > 1 ? 1 : elapsed;
    		var value = this.easing(elapsed);
    
    		for ( property in valuesDelta ) {
    			this.propUpdate(property, _object, valuesStart, valuesDelta, value);
    		}
    
    		if ( elapsed >= 1 ) {
    			if ( this.loopNum == 0 || !this.loop ) {
    				this.complete = true;
    				if ( this.onComplete ) this.onComplete();
    				if ( _chained ) _chained.start();
    				return false;
    			} else if ( this.loop == ig.Tween.Loop.Revert ) {
    				for ( property in valuesStart ) {
    					this.propSet(property, valuesStart, _object); 
    				}
    				_elapsed = 0;
    				timer.reset();
    				if ( this.loopNum != -1 ) this.loopNum--;
    			} else if ( this.loop == ig.Tween.Loop.Reverse ) {
    				var _start = {}, _end = {}, _delta = {};
    				ig.merge(_start, valuesEnd);
    				ig.merge(_end, valuesStart);
    				ig.merge(valuesStart, _start);
    				ig.merge(valuesEnd, _end);
    				for ( property in valuesEnd ) {
    					this.initDelta(property, valuesDelta, _object, valuesEnd);
    				}
    				_elapsed = 0;
    				timer.reset();
    				if ( this.loopNum != -1 ) this.loopNum--;
    			}
    		}
    	};
    	this.pause = function() {
    		this.paused = true;
            if(timer && timer.delta)
            {
                _elapsed += timer.delta();
            }
    	};
    
    	this.resume = function() {
    		this.paused = false;
            if(timer && timer.reset){
                timer.reset();
            }
    		
    	};
    
    	this.stop = function(doComplete) {
    		if ( doComplete ) {
    			this.paused = false;
    			this.complete = false;
    			this.loop = false;
    			_elapsed += duration;
    			this.update();
    		}
    		this.complete = true;
    	}
    };
    
    ig.Tween.Loop = { Revert: 1, Reverse: 2 };
    
    ig.Tween.Easing = { Linear: {}, Quadratic: {}, Cubic: {}, Quartic: {}, Quintic: {}, Sinusoidal: {}, Exponential: {}, Circular: {}, Elastic: {}, Back: {}, Bounce: {} };
    
    ig.Tween.Easing.Linear.EaseNone = function ( k ) {
    	return k;
    };
    
    ig.Tween.Easing.Quadratic.EaseIn = function ( k ) {
    	return k * k;
    };
    
    ig.Tween.Easing.Quadratic.EaseOut = function ( k ) {
    	return - k * ( k - 2 );
    };
    
    ig.Tween.Easing.Quadratic.EaseInOut = function ( k ) {
    	if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
    	return - 0.5 * ( --k * ( k - 2 ) - 1 );
    };
    
    ig.Tween.Easing.Cubic.EaseIn = function ( k ) {
    	return k * k * k;
    };
    
    ig.Tween.Easing.Cubic.EaseOut = function ( k ) {
    	return --k * k * k + 1;
    };
    
    ig.Tween.Easing.Cubic.EaseInOut = function ( k ) {
    	if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
    	return 0.5 * ( ( k -= 2 ) * k * k + 2 );
    };
    
    ig.Tween.Easing.Quartic.EaseIn = function ( k ) {
    	return k * k * k * k;
    };
    
    ig.Tween.Easing.Quartic.EaseOut = function ( k ) {
    	return - ( --k * k * k * k - 1 );
    }
    
    ig.Tween.Easing.Quartic.EaseInOut = function ( k ) {
    	if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
    	return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
    };
    
    ig.Tween.Easing.Quintic.EaseIn = function ( k ) {
    	return k * k * k * k * k;
    };
    
    ig.Tween.Easing.Quintic.EaseOut = function ( k ) {
    	return ( k = k - 1 ) * k * k * k * k + 1;
    };
    
    ig.Tween.Easing.Quintic.EaseInOut = function ( k ) {
    	if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
    	return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
    };
    
    ig.Tween.Easing.Sinusoidal.EaseIn = function ( k ) {
    	return - Math.cos( k * Math.PI / 2 ) + 1;
    };
    
    ig.Tween.Easing.Sinusoidal.EaseOut = function ( k ) {
    	return Math.sin( k * Math.PI / 2 );
    };
    
    ig.Tween.Easing.Sinusoidal.EaseInOut = function ( k ) {
    	return - 0.5 * ( Math.cos( Math.PI * k ) - 1 );
    };
    
    ig.Tween.Easing.Exponential.EaseIn = function ( k ) {
    	return k == 0 ? 0 : Math.pow( 2, 10 * ( k - 1 ) );
    };
    
    ig.Tween.Easing.Exponential.EaseOut = function ( k ) {
    	return k == 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1;
    };
    
    ig.Tween.Easing.Exponential.EaseInOut = function ( k ) {
    	if ( k == 0 ) return 0;
    	if ( k == 1 ) return 1;
    	if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 2, 10 * ( k - 1 ) );
    	return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
    };
    
    ig.Tween.Easing.Circular.EaseIn = function ( k ) {
    	return - ( Math.sqrt( 1 - k * k ) - 1);
    };
    
    ig.Tween.Easing.Circular.EaseOut = function ( k ) {
    	return Math.sqrt( 1 - (--k * k) );
    };
    
    ig.Tween.Easing.Circular.EaseInOut = function ( k ) {
    	if ( ( k /= 0.5 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
    	return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
    };
    
    ig.Tween.Easing.Elastic.EaseIn = function( k ) {
    	var s, a = 0.1, p = 0.4;
    	if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
    	if ( !a || a < 1 ) { a = 1; s = p / 4; }
    	else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
    	return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
    };
    
    ig.Tween.Easing.Elastic.EaseOut = function( k ) {
    	var s, a = 0.1, p = 0.4;
    	if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
    	if ( !a || a < 1 ) { a = 1; s = p / 4; }
    	else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
    	return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
    };
    
    ig.Tween.Easing.Elastic.EaseInOut = function( k ) {
    	var s, a = 0.1, p = 0.4;
    	if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
    	if ( !a || a < 1 ) { a = 1; s = p / 4; }
    	else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
    	if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
    	return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
    };
    
    ig.Tween.Easing.Back.EaseIn = function( k ) {
    	var s = 1.70158;
    	return k * k * ( ( s + 1 ) * k - s );
    };
    
    ig.Tween.Easing.Back.EaseOut = function( k ) {
    	var s = 1.70158;
    	return ( k = k - 1 ) * k * ( ( s + 1 ) * k + s ) + 1;
    };
    
    ig.Tween.Easing.Back.EaseInOut = function( k ) {
    	var s = 1.70158 * 1.525;
    	if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
    	return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
    };
    
    ig.Tween.Easing.Bounce.EaseIn = function( k ) {
    	return 1 - ig.Tween.Easing.Bounce.EaseOut( 1 - k );
    };
    
    ig.Tween.Easing.Bounce.EaseOut = function( k ) {
    	if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
    		return 7.5625 * k * k;
    	} else if ( k < ( 2 / 2.75 ) ) {
    		return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
    	} else if ( k < ( 2.5 / 2.75 ) ) {
    		return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
    	} else {
    		return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
    	}
    };
    
    ig.Tween.Easing.Bounce.EaseInOut = function( k ) {
    	if ( k < 0.5 ) return ig.Tween.Easing.Bounce.EaseIn( k * 2 ) * 0.5;
    	return ig.Tween.Easing.Bounce.EaseOut( k * 2 - 1 ) * 0.5 + 0.5;
    };
    */
    
});