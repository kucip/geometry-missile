ig.module('plugins.audio.sound-handler').requires('plugins.audio.howler-player', 'plugins.audio.sound-info').defines(function () {
    ig.SoundHandler = ig.Class.extend({
        bgmPlayer: null,
        sfxPlayer: null,
        soundInfo: new SoundInfo(),

        init: function () {
            Howler.autoSuspend = false;
            this.sfxPlayer = new HowlerPlayer(this.soundInfo.sfx);
            this.bgmPlayer = new HowlerPlayer(this.soundInfo.bgm);
            if (ig.ua.iOS) this.iOSAudioFix();
        },

        unlockWebAudio: function () {},
        
        iOSAudioFix: function () {
            Howler.ctx.onstatechange = function () {
                if (Howler.ctx.state === 'interrupted') {
                    Howler.ctx.resume().catch(function () {
                        console.log('Failed to resume AudioContext, retrying...');
                        Howler.ctx.suspend().then(function () {
                            setTimeout(function () {
                                Howler.ctx.resume();
                            }, 1000);
                        });
                    });
                }
            };
        },

        muteSFX: function (bool) {
            if (this.sfxPlayer) {
                this.sfxPlayer.mute(bool);
            }
        },

        muteBGM: function (bool) {
            if (this.bgmPlayer) {
                this.bgmPlayer.mute(bool);
            }
        },

        unmuteSFX: function (bool) {
            if (this.sfxPlayer && ig.game && (ig.game.sessionData.sfx || ig.game.sessionData.sound)) {
                this.sfxPlayer.unmute(bool);
            }
        },

        unmuteBGM: function (bool) {
            if (this.bgmPlayer && ig.game && (ig.game.sessionData.bgm || ig.game.sessionData.music)) {
                this.bgmPlayer.unmute(bool);
                !bool && Howler._audioUnlocked && this.bgmPlayer.play('background');
            }
        },

        muteAll: function (bool) {
            this.muteSFX(bool);
            this.muteBGM(bool);
        },

        unmuteAll: function (bool) {
            this.unmuteSFX(bool);
            this.unmuteBGM(bool);
        },

        forceMuteAll: function () {
            this.muteAll(true);
        },

        forceUnMuteAll: function () {
            this.unmuteAll(true);
        },

        forceLoopBGM: function () {},
        onSystemPause: function () {},
        onSystemResume: function () {},

        /** Get Howler Instance of an SFX
         * @param {string} soundName
         */
        getSFX: function (soundName) {
            return this.sfxPlayer.soundList[soundName];
        },

        /* Get Howler Instance of the BGM */
        getBGM: function () {
            return this.bgmPlayer.soundList['background'];
        },

        /** Check SFX is playing 
         * @param {string} soundName
         */
        sfxPlaying: function (soundName) {
            return this.getSFX(soundName).playing();
        },

        stopSFX: function (soundName) {
			if (this.sfxPlaying(soundName)) {
				this.getSFX(soundName).stop();
			}
		},

        /* Check BGM is playing */
        bgmPlaying: function () {
            return this.getBGM().playing();
        },

        stopBGM: function () {
			if (this.bgmPlaying()) {
				this.getBGM().stop();
			}
		},
        
        startBGM: function () {
			if (!this.bgmPlaying()) {
				this.bgmPlayer.play('background');
			}
		}
    });
});