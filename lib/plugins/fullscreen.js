/**
 * Fullscreen button API by Afif
 * 
 * dependency : size-handler plugin, director plugin
 * 
 * docs : https://bit.ly/mjs-fullscreen-docs
 */
ig.module('plugins.fullscreen')
    .requires(
        'impact.entity', 
        'plugins.handlers.size-handler', 
        'plugins.director' 
    ).defines(function () {
        ig.Fullscreen = {
            version: "1.0.0",
            enableFullscreenButton: true,

            _isEnabled: "notChecked",

            isEnabled: function () {
                if (this._isEnabled == "notChecked") {
                    this._isEnabled = (
                        document.fullscreenEnabled ||
                        document.mozFullScreenEnabled ||
                        document.webkitFullscreenEnabled ||
                        document.msFullscreenEnabled
                    ) ? true : false;

                }

                return this._isEnabled;

            },

            isFullscreen: function () {
                if (ig.Fullscreen.isEnabled() && (
                    document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement
                )) return true;
                return false;
            },

            toggleFullscreen: function () {
                if (!ig.Fullscreen.isFullscreen()) {
                    ig.Fullscreen.requestFullscreen();
                } else {
                    ig.Fullscreen.exitFullscreen();
                }
                ig.sizeHandler.orientationDelayHandler();
				
				if (ig && ig.visibilityHandler) {
					ig.visibilityHandler.onChange("focus");
				}
                
                /* attempt to unlock audio */
                try {
                    ig.soundHandler.unlockWebAudio();
                } catch (error) {}
            },

            requestFullscreen: function () {
                var elem = document.documentElement;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                    return;
                }
                if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                    return;
                }
                if (elem.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                    return;
                }
                if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                    return;
                }
                console.log("no request fullscreen method available")
            },

            exitFullscreen: function () {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    return;
                }
                if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                    return;
                }
                if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                    return;
                }
                if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                    return;
                }
                console.log("no exit fullscreen method available")
            },

            divs: {}
        };

        ig.Director.inject({
            loadLevel: function (levelNumber) {
                var divs = ig.Fullscreen.divs;
                for (var key in divs) {
                    var div = ig.domHandler.getElementById("#" + key);
                    ig.domHandler.hide(div);
                }
                return this.parent(levelNumber)
            }
        });

        ig.SizeHandler.inject({
            resize: function () {
                this.parent();
                var divs = ig.Fullscreen.divs;
                for (var key in divs) {
                    var aspectRatioMin = Math.min(ig.sizeHandler.scaleRatioMultiplier.x, ig.sizeHandler.scaleRatioMultiplier.y);
                    var div = ig.domHandler.getElementById("#" + key);
                    var posX = divs[key]['entity_pos_x'];
                    var posY = divs[key]['entity_pos_y'];
                    var sizeX = divs[key]['width'];
                    var sizeY = divs[key]['height'];

                    var canvas = ig.domHandler.getElementById("#canvas");

                    var offsets = ig.domHandler.getOffsets(canvas);

                    if (ig.ua.mobile) {
                        var offsetLeft = offsets.left;
                        var offsetTop = offsets.top;

                        if (ig.sizeHandler.disableStretchToFitOnMobileFlag) {
                            var divleft = Math.floor(offsetLeft + posX * ig.sizeHandler.scaleRatioMultiplier.x) + "px";
                            var divtop = Math.floor(offsetTop + posY * ig.sizeHandler.scaleRatioMultiplier.y) + "px";
                            var divwidth = Math.floor(sizeX * ig.sizeHandler.scaleRatioMultiplier.x) + "px";
                            var divheight = Math.floor(sizeY * ig.sizeHandler.scaleRatioMultiplier.y) + "px";
                        } else {
                            var divleft = Math.floor(posX * ig.sizeHandler.sizeRatio.x) + "px";
                            var divtop = Math.floor(posY * ig.sizeHandler.sizeRatio.y) + "px";
                            var divwidth = Math.floor(sizeX * ig.sizeHandler.sizeRatio.x) + "px";
                            var divheight = Math.floor(sizeY * ig.sizeHandler.sizeRatio.y) + "px";
                        }

                        ig.domHandler.css(div
                            , {
                                float: "left"
                                , position: "absolute"
                                , left: divleft
                                , top: divtop
                                , width: divwidth
                                , height: divheight
                                , "z-index": 3
                            }
                        );
                    }
                    else {
                        var offsetLeft = offsets.left;
                        var offsetTop = offsets.top;

                        var divleft = Math.floor(offsetLeft + posX * aspectRatioMin) + "px";
                        var divtop = Math.floor(offsetTop + posY * aspectRatioMin) + "px";
                        var divwidth = Math.floor(sizeX * aspectRatioMin) + "px";
                        var divheight = Math.floor(sizeY * aspectRatioMin) + "px";

                        ig.domHandler.css(div
                            , {
                                float: "left"
                                , position: "absolute"
                                , left: divleft
                                , top: divtop
                                , width: divwidth
                                , height: divheight
                                , "z-index": 3
                            }
                        );
                    }
                    if (divs[key]['font-size']) {
                        var fontSize = divs[key]['font-size'];
                        ig.domHandler.css(div, { "font-size": (fontSize * aspectRatioMin) + "px" });
                    }
                }
            }
        });

        ig.FullscreenButton = ig.Entity.extend({
            enterImage: null,
            exitImage: null,

            isReady: false,

            zIndex: 999999,

            identifier: null,
            prevPos: { x: 0, y: 0 },

            invisImagePath: 'media/graphics/misc/invisible.png',

            init: function (x, y, settings) {
                this.parent(x, y, settings);
                if (ig.Fullscreen.isEnabled() && ig.Fullscreen.enableFullscreenButton) {
                    if (this.enterImage.loaded) {
                        this.initSize();
                    } else {
                        this.enterImage.loadCallback = function () {
                            this.initSize();
                        }.bind(this);
                    }
                } else {
                    this.kill();
                }
            },

            kill: function () {
                this.parent();

            },

            destroy: function () {
                this.parent();
                console.log("destroy")
            },

            initSize: function () {
                this.size.x = this.enterImage.width;
                this.size.y = this.enterImage.height;

                this.createClickableLayer();

                this.isReady = true;
            },

            createClickableLayer: function () {
                this.identifier = "fullscreen-button-layer";
                var id = "#" + this.identifier;
                var elem = ig.domHandler.getElementById(id);

                if (elem) {
                    ig.domHandler.show(elem);
                    ig.domHandler.attr(elem, 'onclick', "ig.Fullscreen.toggleFullscreen()");
                }
                else {
                    this.createClickableOutboundLayer();
                }

            },

            update: function (x, y, width, height) {
                var x = this.pos.x;
                var y = this.pos.y;
                if (this.isReady) {
                    if (this.prevPos.x === x && this.prevPos.y === y) {
                        return;
                    }
                    else {
                        ig.Fullscreen.divs[this.identifier] = {};
                        ig.Fullscreen.divs[this.identifier]['width'] = this.size.x;
                        ig.Fullscreen.divs[this.identifier]['height'] = this.size.y;
                        ig.Fullscreen.divs[this.identifier]['entity_pos_x'] = this.pos.x;
                        ig.Fullscreen.divs[this.identifier]['entity_pos_y'] = this.pos.y;

                        var div = ig.domHandler.getElementById('#' + this.identifier);
                        this.updateCSS(div);
                    }
                    this.prevPos.x = x;
                    this.prevPos.y = y;
                }
            },

            draw: function () {
                if (this.isReady) {
                    if (ig.Fullscreen.isFullscreen()) { this.exitImage.draw(this.pos.x, this.pos.y); }
                    else { this.enterImage.draw(this.pos.x, this.pos.y); }
                }
            },

            createClickableOutboundLayer: function () {
                var id = this.identifier;
                var image_path = this.invisImagePath;
                // CREATE LAYER
                var div = ig.domHandler.create("div");
                ig.domHandler.attr(div, "id", id);
                ig.domHandler.attr(div, "onclick", "ig.Fullscreen.toggleFullscreen()");
                var newLink = ig.domHandler.create('a');

                var linkImg = ig.domHandler.create('img');

                ig.domHandler.css(linkImg, { width: "100%", height: "100%" });
                ig.domHandler.attr(linkImg, "src", image_path);

                ig.domHandler.addEvent(div, 'mousemove', ig.input.mousemove.bind(ig.input), false);

                ig.domHandler.appendChild(newLink, linkImg);
                ig.domHandler.appendChild(div, newLink);

                ig.domHandler.appendToBody(div);

                // ADD TO HANDLER FOR RESIZING
                ig.Fullscreen.divs[id] = {};
                ig.Fullscreen.divs[id]['width'] = this.size.x;
                ig.Fullscreen.divs[id]['height'] = this.size.y;
                ig.Fullscreen.divs[id]['entity_pos_x'] = this.pos.x;
                ig.Fullscreen.divs[id]['entity_pos_y'] = this.pos.y;

                this.updateCSS(div);
            },

            updateCSS:function(div){
                var aspectRatioMin = Math.min(ig.sizeHandler.scaleRatioMultiplier.x, ig.sizeHandler.scaleRatioMultiplier.y);
                if (ig.ua.mobile) {
                    var canvas = ig.domHandler.getElementById("#canvas");

                    var offsets = ig.domHandler.getOffsets(canvas);

                    var offsetLeft = offsets.left;
                    var offsetTop = offsets.top;

                    console.log(offsets.left)

                    if (ig.sizeHandler.disableStretchToFitOnMobileFlag) {
                        var divleft = Math.floor(offsetLeft + this.pos.x * ig.sizeHandler.scaleRatioMultiplier.x) + "px";
                        var divtop = Math.floor(offsetTop + this.pos.y * ig.sizeHandler.scaleRatioMultiplier.y) + "px";
                        var divwidth = Math.floor(this.size.x * ig.sizeHandler.scaleRatioMultiplier.x) + "px";
                        var divheight = Math.floor(this.size.y * ig.sizeHandler.scaleRatioMultiplier.y) + "px";
                    } else {
                        var divleft = Math.floor(this.pos.x * ig.sizeHandler.sizeRatio.x) + "px";
                        var divtop = Math.floor(this.pos.y * ig.sizeHandler.sizeRatio.y) + "px";
                        var divwidth = Math.floor(this.size.x * ig.sizeHandler.sizeRatio.x) + "px";
                        var divheight = Math.floor(this.size.y * ig.sizeHandler.sizeRatio.y) + "px";
                    }

                    ig.domHandler.css(div
                        , {
                            float: "left"
                            , position: "absolute"
                            , left: divleft
                            , top: divtop
                            , width: divwidth
                            , height: divheight
                            , "z-index": 3
                        }
                    );
                }
                else {
                    var canvas = ig.domHandler.getElementById("#canvas");

                    var offsets = ig.domHandler.getOffsets(canvas);

                    var offsetLeft = offsets.left;
                    var offsetTop = offsets.top;
                    if (ig.sizeHandler.enableStretchToFitOnDesktopFlag) {
                        var divleft = Math.floor(offsetLeft + this.pos.x * ig.sizeHandler.sizeRatio.x) + "px";
                        var divtop = Math.floor(offsetTop + this.pos.y * ig.sizeHandler.sizeRatio.y) + "px";
                        var divwidth = Math.floor(this.size.x * ig.sizeHandler.sizeRatio.x) + "px";
                        var divheight = Math.floor(this.size.y * ig.sizeHandler.sizeRatio.y) + "px";

                    } else {
                        var divleft = Math.floor(offsetLeft + this.pos.x * aspectRatioMin) + "px";
                        var divtop = Math.floor(offsetTop + this.pos.y * aspectRatioMin) + "px";
                        var divwidth = Math.floor(this.size.x * aspectRatioMin) + "px";
                        var divheight = Math.floor(this.size.y * aspectRatioMin) + "px";
                    }
                    ig.domHandler.css(div
                        , {
                            float: "left"
                            , position: "absolute"
                            , left: divleft
                            , top: divtop
                            , width: divwidth
                            , height: divheight
                            , "z-index": 3
                        }
                    );
                }
            }
        });

    });