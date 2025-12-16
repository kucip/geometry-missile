ig.module(
    'plugins.handlers.visibility-handler'
)
.requires(
    'plugins.audio.sound-handler'
)
.defines(function(){
    ig.VisibilityHandler = ig.Class.extend({
        version: "1.2.3", 
        config: {
            muteOnBlur: true,
            pauseOnBlur: true,
            clearInputStateOnPause: false,
            clearInputStateOnResume: true,
            
            allowResumeWithoutFocus: {
                desktop: true,
                mobile: {
                    kaios: false,
                    default: true
                }
            },
            handlerDelay: {
                desktop: 0,
                mobile: {
                    kaios: 0,
                    default: 0
                }
            },
            autoFocusOnResume: {
                desktop: true, 
                mobile: {
                    kaios: false,
                    default: true
                }
            },
            autoFocusAfterResume: {
                desktop: true,
                mobile: {
                    kaios: false,
                    default: true
                }
            }
        },
        browserPrefixes: ["o", "ms", "moz", "webkit"], 
        activeOverlays: [],
        
        browserPrefix: null,
        hiddenPropertyName: null,
        visibilityEventName: null, 
        visibilityStateName: null,
        
        isShowingOverlay: false, 
        isFocused: false, 
        isPaused: false, 
        
        init: function() {
            this.initVisibilityHandler();
            this.initFocusHandler();
            this.initPageTransitionHandler();
            
            ig.visibilityHandler = this;
        },
        
        pauseHandler: function() {
            if (this.config.clearInputStateOnPause === true) {
                this.clearAllInputState();
            }

            if (this.config.pauseOnBlur === true) {
                if (typeof(wgl) !== "undefined" && wgl !== null) {
                    if (wgl.system !== null && typeof (wgl.system) !== "undefined") {
                        if (typeof(wgl.system.stopRender) === "function") {
                            wgl.system.stopRender();
                        }
                    }    
                }
                
                if (typeof(ig.game) !== "undefined" && ig.game !== null) {
                    if (typeof(ig.game.pauseGame) !== 'undefined') {
                        ig.game.pauseGame(true);
                    }
                }
            }

            if (this.config.muteOnBlur === true) {
                if (typeof(ig.soundHandler) !== "undefined" && ig.soundHandler !== null) {
                    if (typeof(ig.soundHandler.forceMuteAll) === "function") {
                        ig.soundHandler.forceMuteAll();
                    }
                }
            }            
        },
        
        resumeHandler: function() {
            if (typeof(ig.game) !== "undefined" && ig.game !== null) {
                if (typeof(ig.game.resumeGame) !== 'undefined') {
                    ig.game.resumeGame(true);
                }

                if (typeof(wgl) !== "undefined" && wgl !== null) {
                    if (wgl.system !== null && typeof (wgl.system) !== "undefined") {
                        if (typeof(wgl.system.startRender) === "function") {
                            wgl.system.startRender();
                        }
                    }    
                }
            }

            if (typeof(ig.soundHandler) !== "undefined" && ig.soundHandler !== null) {
                if (typeof(ig.soundHandler.forceUnMuteAll) === "function") {
                    ig.soundHandler.forceUnMuteAll();
                }
            }

            if (this.config.clearInputStateOnResume === true) {
                this.clearAllInputState();
            }
        },
        
        initVisibilityHandler: function() { 
            this.browserPrefix = this.getBrowserPrefix();
            this.hiddenPropertyName = this.getHiddenPropertyName(this.browserPrefix);
            this.visibilityEventName = this.getVisibilityEventName(this.browserPrefix);
            this.visibilityStateName = this.getVisibilityStateName(this.browserPrefix);
            
            if (this.visibilityEventName) {
                document.addEventListener(this.visibilityEventName, this.onChange.bind(this), true);   /* the content of a tab has become visible or has been hidden */
            }
        },
        
        initFocusHandler: function() {
            window.addEventListener("blur", this.onChange.bind(this), true); /* window element has lost focus (does not bubble) */
            document.addEventListener("blur", this.onChange.bind(this), true);   /* document element has lost focus (does not bubble) */
            document.addEventListener("focusout", this.onChange.bind(this), true);   /* document element is about to lose focus (bubbles) */
            
            window.addEventListener("focus", this.onChange.bind(this), true);    /* window element has received focus (does not bubble) */
            document.addEventListener("focus", this.onChange.bind(this), true);  /* document element has received focus (does not bubble) */
            document.addEventListener("focusin", this.onChange.bind(this), true);    /* document element is about to receive focus (bubbles) */
        },
        
        initPageTransitionHandler: function() {
            window.addEventListener("pagehide", this.onChange.bind(this), true); /* a session history entry is being traversed from */
            window.addEventListener("pageshow", this.onChange.bind(this), true); /* a session history entry is being traversed to */
        },
        
        getBrowserPrefix: function() {
            var browserPrefix = null;
            
            this.browserPrefixes.forEach(function(prefix) {
                if (this.getHiddenPropertyName(prefix) in document) {
                    browserPrefix = prefix;
                    return browserPrefix;
                }
            }.bind(this));
            
            return browserPrefix;
        },
                
        getHiddenPropertyName: function(prefix) {
            return (prefix ? prefix + "Hidden" : "hidden");
        },
        
        getVisibilityEventName: function(prefix) {
            return (prefix ? prefix : "") + "visibilitychange";
        }, 
        
        getVisibilityStateName: function(prefix) {
            return (prefix ? prefix + "VisibilityState" : "visibilityState");
        },
        
        hasView: function() {
            return !(document[this.hiddenPropertyName] || document[this.visibilityStateName] !== "visible");
        },
        
        hasFocus: function() {
            return (document.hasFocus() || this.isFocused);
        },

        addActiveOverlay: function(overlay) {
            if (this.activeOverlays === null || typeof(this.activeOverlays) === "undefined") {
                this.activeOverlays = [];
            }

            if (overlay === null || typeof(overlay) === "undefined") {
                return;
            }

            if (this.activeOverlays.includes(overlay) !== true){
                this.activeOverlays.push(overlay);
            }
        },

        removeActiveOverlay: function(overlay) {
            if (this.activeOverlays === null || typeof(this.activeOverlays) === "undefined") {
                this.activeOverlays = [];
            }

            if (this.activeOverlays.length <= 0) {
                return;
            }

            if (overlay === null || typeof(overlay) === "undefined") {
                return;
            }

            if (this.activeOverlays.includes(overlay) === true){
                this.activeOverlays.splice(this.activeOverlays.indexOf(overlay), 1);
            }
        },
        
        onOverlayShow: function(overlay) {
            if (overlay !== null && typeof(overlay) !== "undefined") {
                this.addActiveOverlay(overlay);
            }

            if (this.activeOverlays.length > 0) {
                this.systemPaused();
                this.isShowingOverlay = true;
            }
        },
        
        onOverlayHide: function(overlay) {
            if (overlay !== null && typeof(overlay) !== "undefined") {
                this.removeActiveOverlay(overlay);
            }

            if (this.activeOverlays.length <= 0) {
                this.isShowingOverlay = false;
                this.systemResumed();
            }
        },
        
        systemPaused: function(event) {
            if (this.isPaused) {
                return false;
            }
            
            this.pauseHandler();
            
            this.isPaused = true;
            
            return true;
        },
        
        systemResumed: function(event) {
            if ( !this.isPaused ) { return false; }
            if ( !this.hasView() || this.isShowingOverlay) { return false; }
            if ( !this.hasFocus() ) {
                if (ig.ua.mobile) {
                    if ( this.isKaiOS() ) {
                        if (!this.config.allowResumeWithoutFocus.mobile.kaios) {
                            return false;
                        }
                    }
                    else {
                        if (!this.config.allowResumeWithoutFocus.mobile.default) {
                            return false;
                        }
                    }
                }
                else {
                    if (!this.config.allowResumeWithoutFocus.desktop) {
                        return false;
                    }
                }
            }
            
            this.focusOnResume();
            
            this.resumeHandler();
            
            this.focusAfterResume();
            
            this.isPaused = false;
            
            return true;
        },

        clearAllInputState: function() {
            if (typeof(ig.input) !== "undefined" && ig.input !== null) {
                if (typeof(ig.input.clearAllState) === "function") {
                    ig.input.clearAllState();
                }
                if (typeof(ig.input.clearPressed) === "function") {
                    ig.input.clearPressed();
                }
                ig.input.locks = {};
            }
        },
        
        isKaiOS: function() {
            return (/KAIOS/).test(navigator.userAgent) || false;
        },
        
        focusOnResume: function() {
            var canFocus = false; 
            
            if (ig.ua.mobile) {
                if ( this.isKaiOS() ) {
                    canFocus = this.config.autoFocusOnResume.mobile.kaios;
                }
                else {
                    canFocus = this.config.autoFocusOnResume.mobile.default;
                }
            }
            else {
                canFocus = this.config.autoFocusOnResume.desktop;
            }
            
            this.focus(canFocus);
        }, 
        
        focusAfterResume: function() {
            var canFocus = false; 
            
            if (ig.ua.mobile) {
                if ( this.isKaiOS() ) {
                    canFocus = this.config.autoFocusAfterResume.mobile.kaios;
                }
                else {
                    canFocus = this.config.autoFocusAfterResume.mobile.default;
                }
            }
            else {
                canFocus = this.config.autoFocusAfterResume.desktop;
            }
            
            this.focus(canFocus);
        },
        
        focus: function(canFocus) {
            if (window.focus && canFocus) {
                if (document.activeElement && typeof (document.activeElement.blur) === "function") {
                    document.activeElement.blur();
                }
                window.focus();
            }
        },
        
        handleDelayedEvent: function(event) {
            if (!this.hasView() || event.type === 'pause' || event.type === 'pageHide' || event.type === 'blur' || event.type === 'focusout') {   
                if (event.type === "blur" || event.type === "focusout") {
                    var path = event.path || (event.composedPath && event.composedPath());
                    if (path && path.length > 2) {
                        /* Game will not paused if the bubbling event source from inside the page (path array >= 2) */
                        return false;
                    }

                    if (event.srcElement && (event.srcElement.tagName === "INPUT" || event.srcElement.tagName === "TEXTAREA")) {
                        /* do not pause if the source element is text input fields (insert name, chatbox) */
                        return false;
                    }

                    this.isFocused = false;
                }
                return this.systemPaused(event);
            }
            else {
                if (event.type === "focus" || event.type === "focusin") {
                    this.isFocused = true;
                }
                
                return this.systemResumed(event);
            }
        },
        
        startDelayedEventHandler: function(event) {
            if (ig.ua.mobile) {
                if ( this.isKaiOS() ) {
                    if (this.config.handlerDelay.mobile.kaios > 0) {
                        window.setTimeout(function(event) {
                            this.handleDelayedEvent(event);
                        }.bind(this, event), this.config.handlerDelay.mobile);
                    }
                    else {
                        this.handleDelayedEvent(event);
                    }
                }
                else {
                    if (this.config.handlerDelay.mobile.default > 0) {
                        window.setTimeout(function(event) {
                            this.handleDelayedEvent(event);
                        }.bind(this, event), this.config.handlerDelay.mobile);
                    }
                    else {
                        this.handleDelayedEvent(event);
                    }
                }
            }
            else {
                if (this.config.handlerDelay.desktop > 0) {
                    window.setTimeout(function(event) {
                        this.handleDelayedEvent(event);
                    }.bind(this, event), this.config.handlerDelay.desktop);
                }
                else {
                    this.handleDelayedEvent(event);
                }
            }
        },
        
        onChange: function(event) {    
            // console.log("Event", event);        
            this.startDelayedEventHandler(event);
        }
    });
});
