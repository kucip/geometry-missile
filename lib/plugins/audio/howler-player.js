ig.module('plugins.audio.howler-player').defines(function () {
	HowlerPlayer = ig.Class.extend({
		VERSION: "1.0.2",
		tagName: "HowlerPlayer",

		isMuted: false,

		soundList: {},

		init: function (list) {
			var folder = "media/audio/";

			for (var soundName in list) {
				var sound = list[soundName];
				var pathMp3 = folder + sound.path + ".mp3";

				this.soundList[soundName] = new Howl({
					src: [pathMp3],
					loop: !!sound.loop,
					onend: function () {
						this.seekId = 0;
					}
				});
			}
		},

		play: function (audio) {
			if (!this.isMuted) {
				var sound = typeof (audio) === "string" ? this.soundList[audio] : audio;
				if (!sound._loop || !sound.playing()) {
					sound.playId = sound.play();
				}
			}
		},

		stop: function (audio) {
			var sound = typeof (audio) === "string" ? this.soundList[audio] : audio;
			if (sound.playing()) {
				sound.stop();
				sound.seekId = 0;
			}
		},

		pause: function (audio) {
			var sound = typeof (audio) === "string" ? this.soundList[audio] : audio;
			sound.pause(sound.playId);
			sound.seekId = sound.seek(sound.playId);
		},

		resume: function (audio) {
			var sound = typeof (audio) === "string" ? this.soundList[audio] : audio;
			sound.play(sound.playId);
			sound.seek(sound.seekId, sound.playId);
		},

		mute: function (fromFocusBlur) {
			if (!fromFocusBlur) this.isMuted = true;
			for (var soundName in this.soundList) {
				var sound = this.soundList[soundName];
				if (sound.playing()) this.pause(soundName);
			}
		},

		unmute: function (fromFocusBlur) {
			if (!fromFocusBlur) this.isMuted = false;
			if (!this.isMuted) {
				for (var soundName in this.soundList) {
					sound = this.soundList[soundName];
					if (sound.seekId > 0) this.resume(soundName);
				}
			}
		},

		volume: function (value) {
			if (typeof value !== "number") {
				console.warn("Argument needs to be a number!");
				return;
			}
			value = value.limit(0, 1);
			for (var soundName in this.soundList) {
				this.soundList[soundName].volume(value);
			}
		},

		getVolume: function () {
			for (var soundName in this.soundList) {
				return this.soundList[soundName].volume();
			}
		}
	});
});