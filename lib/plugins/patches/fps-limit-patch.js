/**
 * FPS Limit Patch
 * to make sure the FPS is capped at 60 on displays with high refresh rate
 */
 ig.module(
	"plugins.patches.fps-limit-patch"
).requires(
	'impact.system',
	'impact.impact'
).defines(function() {
	var version = "1.0.0";
	var enableFPSLock = true; // set to false to disable fps lock
	var targetFPS = 60; // set to 60 to lock to 60 fps
	var fpsLockThreshold = 63; // start slowing down at this FPS, generally we can get away with +3 or +4 of targetFPS
	var fpsLockMethod = {
		forcedTimeout: true // use setTimeout to slow down the framerate to targetFPS 
	};

	// Override ig.System to set the FPS at target
	ig.System.inject({
		fps: targetFPS
	});
	if (ig.system) {
		ig.system.fps = targetFPS;
	}

	// Use requestAnimationFrame if available
	ig.normalizeVendorAttribute( window, 'requestAnimationFrame' );
	if( window.requestAnimationFrame ) {
		var next = 1,
			anims = {};
	
		window.ig.setAnimation = function( callback, element ) {
			var current = next++;
			anims[current] = true;
			
			var frameInterval = (1000/targetFPS), fpsCounter = targetFPS;
			var tick = 0, lastTime = 0, delay = 0, elapsed = 0;
			var animate = function() {
				if( !anims[current] ) { return; } // deleted?

				// current timestamp
				timestamp = Date.now();
				
				// The previous time the step was called
				lastTime = tick;

				// The most recent timestamp
				tick = timestamp;

				// Time elapsed and fps counter
				elapsed = tick - lastTime;
				fpsCounter = fpsCounter * 0.8 + 0.2 * (1000/elapsed); 
				// console.log(fpsCounter);

				if(enableFPSLock) {
					if(fpsCounter > targetFPS && fpsCounter >= fpsLockThreshold) {
						// Calculate the delay (in ms) to call the next step
						delay = Math.min(Math.max(frameInterval * 2 + lastTime - timestamp, 0), frameInterval);

						if (fpsLockMethod.forcedTimeout) {
							// schedule a timeout to call the next step
							setTimeout(function() {
								window.requestAnimationFrame( animate, element );
							}, delay);
							callback(timestamp);
						}						
					} else {
						window.requestAnimationFrame( animate, element );
						callback();
					}
				}
				else {
					window.requestAnimationFrame( animate, element );
					callback();
				}
			};
			window.requestAnimationFrame( animate, element );
			return current;
		};
	
		window.ig.clearAnimation = function( id ) {
			delete anims[id];
		};
	}
	
	// [set/clear]Interval fallback
	else {
		window.ig.setAnimation = function( callback, element ) {
			return window.setInterval( callback, 1000/targetFPS );
		};
		window.ig.clearAnimation = function( id ) {
			window.clearInterval( id );
		};
	}
});

