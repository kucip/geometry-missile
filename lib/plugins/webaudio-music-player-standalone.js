// Jason Low's WebAudio Music Player Class
// jason.low@impact360design.com
// ver 1.7

// Known issues:
// - only supports 1 music file for now
// - only supports ogg and mp3 formats
// - always loops bgm

// Version notes:
// 1.8 - added workaround for xhr CORS issue
// 1.7 - fix offset < 0 bug
// 1.7 - fix issue when webaudio play happens in a short time after Howler reinit
// 1.6 - reuse Howler or global webaudio context if available
// 1.5 - volume() can be used as an alias for getVolume()
// 1.4 - Added option flag for reinit Web Audio on play
// 1.3 - Added fallback using HTML5 Audio for IE compatibilty
// 1.2 - fixed mute bug: retain bgmPlaying flag
// 1.2 - fixed pausedTime bug
// 1.2 - add offset param to play()
// 1.1 - ios mp3 compatibility fix, fixed some bug on unmute

// available functions
// this.webaudioPlugin.play();
// this.webaudioPlugin.stop();
// this.webaudioPlugin.mute();
// this.webaudioPlugin.unmute();
// this.webaudioPlugin.volume(val);
// this.webaudioPlugin.getVolume();

// Usage Examples:
/*
var musicList = {
    bgm: {path:'media/game/audio/music/bgm'}
}

this.webaudioPlugin = new WebaudioMusicPlayer(musicList);

// enable autoplay once file is loaded
this.webaudioPlugin.bgmPlaying = true;
*/

ig.module(
    'plugins.webaudio-music-player-standalone'
)
.requires(

)
.defines(function(){
    WebaudioMusicPlayer = ig.Class.extend({
        bgmPlaying:false,
        isSupported:false,

        muteFlag: false,
        pausedTime: 0,
        webaudio: null,

        useHTML5Audio: false,

        audio: null,
        inactiveAudio: null,

        codecs: null,
        reinitOnPlay: false,
        inputList: null,

        _volume: 1,

        soundList:{

        },

        init: function(list) {
            this.webaudio = {
                compatibility: {},
                gainNode: null,
                buffer: null,
                source_loop: {},
                source_once: {}
            };

            //References:
            // https://forestmist.org/blog/web-audio-api-loops
            // http://www.html5rocks.com/en/tutorials/webaudio/intro/

            try {
                // More info at http://caniuse.com/#feat=audio-api
                this.AudioContext = window.AudioContext || window.webkitAudioContext;

                if(Howler && Howler.context){
                    this.webaudio.context = Howler.context;
                    ig.global.webaudio_context = this.webaudio.context;
                    this.isSupported = true;
                    console.log('using howler webaudio context');

                }else if(ig.global.webaudio_context){
                    this.webaudio.context = ig.global.webaudio_context;
                    this.isSupported = true;

                }else{
                    this.webaudio.context = new this.AudioContext();
                    ig.global.webaudio_context = this.webaudio.context;
                    this.isSupported = true;
                }

            } catch(e) {
                console.log('Web Audio API not supported in this browser.');
                this.webaudio = null;

                //enable fallback mode
                this.useHTML5Audio = true;
            }
            ig.global.webaudio = this.webaudio;

            //fallback
            if(this.useHTML5Audio){
                if (typeof(Audio) !== 'undefined') {
                    try {
                        new Audio();
                    } catch(e) {
                        this.useHTML5Audio = false;
                    }
                } else {
                    this.useHTML5Audio = false;
                }
            }

            if(this.useHTML5Audio){
                this.audio = new Audio();
                this.isSupported = true;
                this.initHTML5Audio(list);
            }

            if(!this.isSupported) {
                return null;
            }

            if(this.webaudio) {
                this.inputList = list;
                this.initWebAudio(list);
            }
        },
        initWebAudio:function(list){
            if(ig.ua.iOS){
                this.initIOSWebAudioUnlock();
            }

            this.webaudio.gainNode = (typeof this.webaudio.context.createGain === 'undefined') ? this.webaudio.context.createGainNode() : this.webaudio.context.createGain();
            this.webaudio.gainNode.connect(this.webaudio.context.destination);

            this.webaudio.gainNode.gain.value = this._volume;

            this.webaudio.buffer = null;

            //---------------
            // Compatibility
            //---------------
            var start = 'start',
                stop = 'stop',
                buffer = this.webaudio.context.createBufferSource();

            if (typeof buffer.start !== 'function') {
                start = 'noteOn';
            }
            this.webaudio.compatibility.start = start;

            if (typeof buffer.stop !== 'function') {
                stop = 'noteOff';
            }
            this.webaudio.compatibility.stop = stop;

            //-------------------------------
            // Setup Audio File
            //-------------------------------
            for(var soundName in list)
            {
                this.soundList[soundName] = soundName;

                var soundPath = list[soundName].path;
                var pathOgg = soundPath+"."+ig.Sound.FORMAT.OGG.ext;
                var pathMp3 = soundPath+"."+ig.Sound.FORMAT.MP3.ext;

                var path = pathOgg;
                if(ig.ua.mobile){
                    if(ig.ua.iOS){
                       path = pathMp3;
                    }
                }else{
                    var ua = navigator.userAgent.toLowerCase();
                    if (ua.indexOf('safari') != -1) {
                        if (ua.indexOf('chrome') <= -1) {
                            // Safari
                            path = pathMp3;
                        }
                    }
                }

                var req = new XMLHttpRequest();
                req.open('GET', path, true);
                req.responseType = 'arraybuffer';
                req.onload = function() {
                    this.webaudio.context.decodeAudioData(
                        req.response,
                        function(buffer) {
                            this.webaudio.buffer = buffer;
                            this.webaudio.source_loop = {};
                            if(this.bgmPlaying){
                                this.play(null, true);
                            }else{
                                this.stop();
                            }
                        }.bind(this),
                        function() {
                            console.log('Error decoding audio "' + path + '".');
                        }
                    );
                }.bind(this);

                req.send();

                if(req.readyState == 4){
                    if (typeof(Audio) !== 'undefined') {
                        this.useHTML5Audio = true;
                        try {
                            new Audio();
                        } catch(e) {
                            this.useHTML5Audio = false;
                        }

                        if(this.useHTML5Audio){
                            console.log('Using HTML5 Audio');
                            this.webaudio = null;
                            this.audio = new Audio();
                            this.isSupported = true;
                            this.initHTML5Audio(list);
                        }
                    }
                }

                // limit 1 file for now
                return;
            }
        },
        initIOSWebAudioUnlock:function(){
            if(!this.webaudio) return;

            webaudio = this.webaudio;

            // call this method on touch end to create and play a buffer,
            // then check if the audio actually played to determine if
            // audio has now been unlocked on iOS
            var unlock = function() {
                var ctx = webaudio.context;
                // create an empty buffer
                var buffer = ctx.createBuffer(1, 1, 22050);
                var source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);

                // play the empty buffer
                if (typeof source.start === 'undefined') {
                  source.noteOn(0);
                } else {
                  source.start(0);
                }

                // setup a timeout to check that we are unlocked on the next event loop
                setTimeout(function() {
                  if ((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
                    // update the unlocked state and prevent this check from happening again
                    //self._iOSEnabled = true;
                    //self.iOSAutoEnable = false;

                    // remove the touch start listener
                    window.removeEventListener('touchend', unlock, false);
                  }
                }.bind(this), 0);
            };

            // setup a touch start listener to attempt an unlock in
            window.addEventListener('touchend', unlock, false);
        },
        initHTML5Audio:function(list){
            if(!this.useHTML5Audio || !this.audio) return;
            var audio = this.audio;
            this.codecs = {};
            this.codecs = {
                mp3: !!audio.canPlayType('audio/mpeg;').replace(/^no$/, ''),
                opus:!!audio.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
                ogg: !!audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
                wav: !!audio.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
                aac: !!audio.canPlayType('audio/aac;').replace(/^no$/, ''),
                m4a: !!(audio.canPlayType('audio/x-m4a;') || audio.canPlayType('audio/m4a;') || audio.canPlayType('audio/aac;')).replace(/^no$/, ''),
                mp4: !!(audio.canPlayType('audio/x-mp4;') || audio.canPlayType('audio/mp4;') || audio.canPlayType('audio/aac;')).replace(/^no$/, ''),
                weba:!!audio.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')
            };

            this.is = {
                ff: Boolean(!(window.mozInnerScreenX == null) && /firefox/.test( navigator.userAgent.toLowerCase() )),
                ie: Boolean(document.all && !window.opera),
                opera: Boolean(window.opera),
                chrome: Boolean(window.chrome),
                safari: Boolean(!window.chrome && /safari/.test( navigator.userAgent.toLowerCase() ) && window.getComputedStyle && !window.globalStorage && !window.opera)
            };
            this.playDelay = -60;
            this.stopDelay = 30;
            if(this.is.chrome) this.playDelay = -25;
            if(this.is.chrome) this.stopDelay = 25;
            if(this.is.ff) this.playDelay = -25;
            if(this.is.ff) this.stopDelay = 85;
            if(this.is.opera) this.playDelay = 5;
            if(this.is.opera) this.stopDelay = 0;

            //-------------------------------
            // Setup Audio File
            //-------------------------------
            for(var soundName in list)
            {
                this.soundList[soundName] = soundName;

                var soundPath = list[soundName].path;
                var pathOgg = soundPath+"."+ig.Sound.FORMAT.OGG.ext;
                var pathMp3 = soundPath+"."+ig.Sound.FORMAT.MP3.ext;
                var path = null;

                if(this.codecs[ig.Sound.FORMAT.OGG.ext.toLowerCase()]){
                    path = pathOgg;
                }else if(this.codecs[ig.Sound.FORMAT.MP3.ext.toLowerCase()]){
                    path = pathMp3;
                }

                if(!path) continue;

                //Exceptions (override default)
                if(ig.ua.mobile){
                    if(ig.ua.iOS){
                       path = pathMp3;
                    }
                }else{
                    var ua = navigator.userAgent.toLowerCase();
                    if (ua.indexOf('safari') != -1) {
                        if (ua.indexOf('chrome') <= -1) {
                            // Safari
                            path = pathMp3;
                        }
                    }
                }

                // listen for errors with HTML5 audio (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror)
                this.audio.addEventListener('error', function () {
                    if (this.audio.error && this.audio.error.code === 4) {
                        this.isSupported = false;
                    }
                }, false);

                // setup the new audio node
                this.audio.src = path;
                this.audio._pos = 0;
                //this.audio.loop = true;
                this.audio.preload = 'auto';
                this.audio.volume = this._volume;

                // setup duplicate node for force looping
                this.inactiveAudio = new Audio();
                this.inactiveAudio.src = path;
                this.inactiveAudio._pos = 0;
                this.inactiveAudio.preload = 'auto';
                this.inactiveAudio.volume = this._volume;
                this.inactiveAudio.load();

                // setup the event listener to start playing the sound
                // as soon as it has buffered enough
                var listener = function() {
                    // round up the duration when using HTML5 Audio to account for the lower precision
                    //this._duration = Math.ceil(this.audio.duration * 10) / 10;
                    this._duration = this.audio.duration;

                    if (!this._loaded) {
                        this._loaded = true;
                    }

                    if(this.bgmPlaying){
                        this.play(null, true);
                    }else{
                        this.stop();
                    }

                    // clear the event listener
                    this.audio.removeEventListener('canplaythrough', listener, false);
                }.bind(this);
                this.audio.addEventListener('canplaythrough', listener, false);
                this.audio.load();

                // limit 1 file for now
                return;
            }
        },
        play:function(offset, onInit)
        {
            if(!this.isSupported) return;
            this.bgmPlaying = true;
            if(this.webaudio){
                if(!onInit && this.reinitOnPlay){
                    if(this.webaudio.source_loop.buffer == this.webaudio.buffer) {
                        if(this.webaudio.source_loop._playing) {
                            this.webaudio.source_loop[this.webaudio.compatibility.stop](0);
                            this.webaudio.source_loop._playing = false;
                            var d = this.webaudio.context.currentTime - this.webaudio.source_loop._startTime;
                            this.pausedTime += d;
                            this.pausedTime = this.pausedTime % this.webaudio.source_loop.buffer.duration;
                            this.webaudio.source_loop._startTime = 0;
                            if (this.webaudio.compatibility.start === 'noteOn') {
                                this.webaudio.source_once[this.webaudio.compatibility.stop](0);
                            }
                        }
                        try{
                            if(Howler && Howler.context){
                                var d = Date.now() - Howler.lastPlayTime;
                                if(d >= 30000){
                                    Howler.reinit(true);
                                }
                                this.webaudio.context = Howler.context;
                                ig.global.webaudio_context = this.webaudio.context;

                            }else{
                                this.webaudio.context.close();
                                delete this.webaudio.context;
                                this.webaudio.context = new this.AudioContext();
                                ig.global.webaudio_context = this.webaudio.context;
                            }
                            this.webaudio.gainNode = this.webaudio.context.createGain();
                            this.webaudio.gainNode.connect(this.webaudio.context.destination);
                            this.webaudio.gainNode.gain.value = this._volume;
                            var start = 'start',
                                stop = 'stop',
                                buffer = this.webaudio.context.createBufferSource();

                            if (typeof buffer.start !== 'function') {
                                start = 'noteOn';
                            }
                            this.webaudio.compatibility.start = start;

                            if (typeof buffer.stop !== 'function') {
                                stop = 'noteOff';
                            }
                            this.webaudio.compatibility.stop = stop;

                            this.webaudio.source_loop = {};
                            this.play(null, true);

                            //console.log("Webaudio Music reinitialized");
                        }catch(e){
                        }
                    }
                }

                if(!this.webaudio.buffer) {
                    this.bgmPlaying = true;
                    return;
                }

                if(!this.muteFlag)
                {
                    this.bgmPlaying = true;

                    if (this.webaudio.source_loop._playing) {
                        //this.stop();
                    } else {
                        if(Howler && Howler.context){
                            this.webaudio.context = Howler.context;
                            ig.global.webaudio_context = this.webaudio.context;
                        }
                        this.webaudio.source_loop = this.webaudio.context.createBufferSource();
                        this.webaudio.source_loop.buffer = this.webaudio.buffer;
                        this.webaudio.source_loop.loop = true;

                        if(Howler && Howler.context){
                            this.webaudio.gainNode = this.webaudio.context.createGain();
                            this.webaudio.gainNode.connect(this.webaudio.context.destination);
                            this.webaudio.gainNode.gain.value = this._volume;
                        }

                        this.webaudio.source_loop.connect(this.webaudio.gainNode);

                        if(offset == null || isNaN(offset) || offset < 0){
                            offset = 0;
                            if(this.pausedTime >= 0){
                                offset = this.pausedTime;
                            }
                        }
                        this.webaudio.source_loop._startTime = this.webaudio.context.currentTime;

                        if (this.webaudio.compatibility.start === 'noteOn') {
                            /*
                            The depreciated noteOn() function does not support offsets.
                            Compensate by using noteGrainOn() with an offset to play once and then schedule a noteOn() call to loop after that.
                            */
                            this.webaudio.source_once = this.webaudio.context.createBufferSource();
                            this.webaudio.source_once.buffer = this.webaudio.buffer;
                            this.webaudio.source_once.connect(this.webaudio.gainNode);
                            this.webaudio.source_once.noteGrainOn(0, offset, this.webaudio.buffer.duration - offset); // currentTime, offset, duration
                            /*
                            Note about the third parameter of noteGrainOn().
                            If your sound is 10 seconds long, your offset 5 and duration 5 then you'll get what you expect.
                            If your sound is 10 seconds long, your offset 5 and duration 10 then the sound will play from the start instead of the offset.
                            */

                            // Now queue up our looping sound to start immediatly after the source_once audio plays.
                            var o = this.webaudio.context.currentTime + (this.webaudio.buffer.duration - offset);
                            if(o < 0) o = 0;
                            this.webaudio.source_loop[this.webaudio.compatibility.start](o);
                        } else {
                            this.webaudio.source_loop[this.webaudio.compatibility.start](0, offset);
                        }
                        this.webaudio.source_loop._playing = true;
                    }
                }
                return;
            }

            if(this.audio){
                var node = this.audio;

                if(!this.muteFlag)
                {
                    this.bgmPlaying = true;

                    if(isNaN(offset)){
                        offset = 0;
                        if(this.pausedTime){
                            offset = this.pausedTime;
                        }
                    }

                    //determine when to force loop
                    var duration = this._duration - offset;

                    if(this._onEndTimer) {
                        clearTimeout(this._onEndTimer);
                        this._onEndTimer = null;
                    }
                    this._onEndTimer = setTimeout(function() {
                        // forceLoop
                        this.audio.currentTime = 0;
                        this.audio.pause();
                        this.pausedTime = 0;
                        //swap nodes
                        if(this.inactiveAudio){
                            var temp = this.audio;
                            this.audio = this.inactiveAudio;
                            this.inactiveAudio = temp;
                        }
                        this.play();

                    }.bind(this), duration*1000 + this.playDelay);

                    //start playing
                    if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
                        node.readyState = 4;
                        node.currentTime = offset;
                        node.muted = this.muteFlag || node.muted;
                        node.volume = this._volume;
                        setTimeout(function() { node.play();}, 0);
                    } else {
                        clearTimeout(this._onEndTimer);
                        this._onEndTimer = null;
                        (function(){
                            var listener = function() {
                                if(typeof(this.play == 'function')){
                                    this.play();

                                    // clear the event listener
                                    node.removeEventListener('canplaythrough', listener, false);
                                }
                            }.bind(this);
                            node.addEventListener('canplaythrough', listener, false);
                        }.bind(this))();

                    }
                }
            }
        },
        stop:function()
        {
            this.bgmPlaying = false;
            if(!this.isSupported) return;

            if(this.webaudio){
                if (this.webaudio.source_loop._playing) {
                    this.webaudio.source_loop[this.webaudio.compatibility.stop](0);
                    this.webaudio.source_loop._playing = false;
                    var d = this.webaudio.context.currentTime - this.webaudio.source_loop._startTime;
                    this.pausedTime += d;
                    this.pausedTime = this.pausedTime % this.webaudio.source_loop.buffer.duration;
                    this.webaudio.source_loop._startTime = 0;
                    if (this.webaudio.compatibility.start === 'noteOn') {
                        this.webaudio.source_once[this.webaudio.compatibility.stop](0);
                    }
                }
                return;
            }

            if(this.audio){
                var node = this.audio;
                if(node.readyState == 4){
                    this.pausedTime = node.currentTime;
                    node.currentTime = 0;
                    node.pause();
                    clearTimeout(this._onEndTimer);
                    this._onEndTimer = null;
                }
            }
        },
        volume:function(value)
        {
            if(isNaN(value) || value == null) return this.getVolume();
            if(!this.isSupported) return;

            this._volume = value;
            if(this._volume < 0) {
                this._volume = 0;
            }else if(this._volume > 1) {
                this._volume = 1;
            }

            if(this.webaudio){
                if(!this.webaudio.gainNode) return;
                this.webaudio.gainNode.gain.value = this._volume;
                return;
            }

            if(this.audio){
                this.audio.volume = this._volume;
                if(this.inactiveAudio){
                    this.inactiveAudio.volume = this._volume;
                }
            }
        },
        getVolume:function()
        {
            if(!this.isSupported) return 0;

            return this._volume;

            if(this.webaudio){
                if(!this.webaudio.gainNode) return 0;
                return this.webaudio.gainNode.gain.value;
            }

            if(this.audio){
                var node = this.audio;
                return node.volume;
            }
        },

        mute:function()
        {
            if(this.muteFlag==false){
                this.muteFlag = true;
                if(this.bgmPlaying)
                {
                    this.stop();
                    this.bgmPlaying = true;
                }
            }
        },

        unmute:function()
        {
            if(this.muteFlag==true){
                this.muteFlag = false;
                if(this.bgmPlaying)
                {
                    this.play();
                }
            }
        }

    });
});