/**
 * Timer patch 
 * to make sure the calculation in time difference (delta value) is non-negative, where the time doesn't flow backward
 */
ig.module(
	"plugins.patches.timer-patch"
).requires(
	'impact.timer'
).defines(function() {
	ig.Timer.step = function() {
		var current = Date.now();
		var delta = (current - ig.Timer._last) / 1000;
		if (delta < 0) {
			delta = 0;
		}
		
		ig.Timer.time += Math.min(delta, ig.Timer.maxStep) * ig.Timer.timeScale;
		ig.Timer._last = current;
	};
});