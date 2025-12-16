/**
 * Plugin by Nam
 */
ig.module('game.plugin')
    .requires(
        'plugins.handlers.size-handler',
        'impact.game',
        'impact.timer',
        'impact.entity'
    ).defines(function () {

        ig.SizeHandler.inject({
            minW: 1800,
            minH: 1800,
            portraitMode: true,
            sizeCalcs: function () {                
                var w = window.innerWidth,
                    h = window.innerHeight,
                    newW, newH;
                this.r0 = this.minW / this.minH;
                if (w / h < this.r0) {
                    newW = this.minW;
                    newH = Math.round(newW / w * h);
                } else {
                    newH = this.minH;
                    newW = Math.round(newH / h * w);
                }

                if (ig.system) {
                    this.dx = (ig.system.width - newW) / 2;
                    this.dy = (ig.system.height - newH) / 2;
                    ig.system.resize(newW, newH, this.scale);
                }

                this.windowSize = new Vector2(w, h);
                this.scaleRatioMultiplier = new Vector2(w / newW, h / newH);
                this.desktop.actualResolution = new Vector2(w, h);
                this.mobile.actualResolution = new Vector2(w, h);
                this.desktop.actualSize = new Vector2(w, h);
                this.mobile.actualSize = new Vector2(w, h);

                if (ig.game) {
                    ig.game.midX = ig.system.width / 2;
                    ig.game.midY = ig.system.height / 2;

                    ig.game.screen.x += this.dx;
                    ig.game.screen.y += this.dy;

                    ig.game.update();
                    ig.game.draw();

                    this.repositionEntities();
                } else if (ig.loader) {
                    // ig.loader.repos();
                    ig.loader.draw();
                }
            },

            repositionEntities: function () {
                if (ig.game) {
                    for (var i = 0, len = ig.game.entities.length; i < len; i++) {
                        var e = ig.game.entities[i];
                        if (e && typeof e.repos === 'function') e.repos();
                    }
                }
            }
        });

        /* NEW POINTER HANDLING */
        ig.Game.inject({
            update: function () {
                this.parent();

                if (ig.input.pressed('click')) {
                    var targetObject = null;
                    for (var i = this.entities.length - 1; i > -1; i--) {
                        var e = this.entities[i];
                        // if (e.isClickable && e.underPointer()) {
                        //     if (!targetObject || targetObject.zIndex < e.zIndex) {
                        //         targetObject = e;
                        //     }
                        // }
                        if (e.isClickable) {
                            if (e.underPointer()) {
                                if (!targetObject || targetObject.zIndex < e.zIndex) {
                                    targetObject = e;
                                }
                            } else if (e.isClicked) e.isClicked = false;
                        }
                    }
                    if (targetObject && typeof (targetObject.clicked) === 'function') targetObject.clicked();
                }

                if (ig.input.state('click')) {
                    var targetObject = null;
                    for (var i = this.entities.length - 1; i > -1; i--) {
                        var e = this.entities[i];
                        if (e.isClickable && e.underPointer()) {
                            if (!targetObject || targetObject.zIndex < e.zIndex) {
                                targetObject = e;
                            }
                        }
                    }
                    if (targetObject && typeof (targetObject.clicking) === 'function') targetObject.clicking();
                }

                if (ig.input.released('click')) {
                    var targetObject = null;
                    for (var i = this.entities.length - 1; i > -1; i--) {
                        var e = this.entities[i];
                        if (e.isClickable && e.underPointer()) {
                            if (!targetObject || targetObject.zIndex < e.zIndex) {
                                targetObject = e;
                            }
                        }
                    }
                    if (targetObject && typeof (targetObject.released) === 'function') targetObject.released();
                }
            },
            /* HANDLE DRAWING BACKGROUND IMAGE */
            // clearColor: false, // override default setting in impactJS framework
            draw: function () {
                ig.system.context.clearRect(0, 0, ig.system.width, ig.system.height);
                this.parent();
            }
        });

        /* HANDLE MOUSE INPUT (NO NEED TO USE POINTER ENTITY) */
        ig.Entity.inject({
            isClickable: false,
            zIndex: 1,
            underPointer: function () {
                var p = ig.game.io.getClickPos();
                var p2 = {
                    x: p.x + ig.game.screen.x,
                    y: p.y + ig.game.screen.y
                }
                return this.containPoint(p2);
            },
            containPoint: function (p) {
                var x0 = this.pos.x,
                    x1 = x0 + this.size.x,
                    y0 = this.pos.y,
                    y1 = y0 + this.size.y;
                return (p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1);
            },
            midX: function () {
                return this.pos.x + this.size.x / 2;
            },
            midY: function () {
                return this.pos.y + this.size.y / 2;
            },
            rightX: function () {
                return this.pos.x + this.size.x;
            },
            bottomY: function () {
                return this.pos.y + this.size.y;
            },
            center: function () {
                return {
                    x: this.midX(),
                    y: this.midY()
                }
            }
        });

        ig.Timer.inject({
            init: function (seconds, paused) {
                this.parent(seconds);
                if (paused) this.pause();
            },

            reset: function (paused) {
                this.base = ig.Timer.time;
                this.pausedAt = 0;
                if (paused) this.pause();
            }
        });

        /* UTILES */
        ig.util = {
            pi2: Math.PI * 2,
            pio2: Math.PI / 2,
            lerp: function (value1, value2, amount) {
                // amount = amount < 0 ? 0 : amount;
                // amount = amount > 1 ? 1 : amount;
                return value1 + (value2 - value1) * amount;
            },
            drawImageScaled: function (image) {
                ig.system.context.drawImage(image.data, 0, 0, image.width, image.height, 0, 0, ig.system.width, ig.system.height);
            },
            drawImageScaledNoStretched: function (image) {
                var r = image.width / image.height;
                var cr = ig.system.width / ig.system.height;
                var w, h;
                if (r < cr) {
                    w = ig.system.width;
                    h = w / r;
                } else {
                    h = ig.system.height;
                    w = h * r;
                }
                ig.system.context.drawImage(image.data, 0, 0, image.width, image.height, (ig.system.width - w) / 2, (ig.system.height - h) / 2, w, h);
            },
            distance: function (p1, p2) {
                return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            },
            distance2: function (x1, y1, x2, y2) {
                return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            },
            angle: function (p1, p2) {
                return Math.atan2(p2.y - p1.y, p2.x - p1.x);
            },
            angle2: function (x1, y1, x2, y2) {
                return Math.atan2(y2 - y1, x2 - x1);
            },
            toRad: function (deg) {
                return deg / 180 * Math.PI;
            },
            toDeg: function (rad) {
                return rad / Math.PI * 180;
            },
            rBetween: function (a, b) {
                return a + Math.random() * (b - a);
            },
            iBetween: function (a, b) {
                return a + Math.floor(Math.random() * (b - a + 1));
            },
            rArray: function (arr) {
                var r = Math.floor(Math.random() * arr.length);
                return arr[r];
            },
            pick: function (arr) {
                var r = Math.floor(Math.random() * arr.length);
                return arr.splice(r, 1)[0];
            },
            rget: function (arr) {
                var r = Math.floor(Math.random() * arr.length);
                return arr[r];
            },
            containPoint: function (vertices, point) {
                var check;
                for (var i = 0; i < vertices.length; i++) {
                    var j = i + 1;
                    if (j == vertices.length) j = 0;
                    var p0 = vertices[i],
                        p1 = vertices[j];
                    var side = (point.y - p0.y) * (p1.x - p0.x) - (point.x - p0.x) * (p1.y - p0.y);
                    if (side == 0) return true;
                    if (i === 0) check = side;
                    else if (check * side < 0) return false;
                }
                return true;
            },
            normalizeAngle: function (angle) {
                var n = Math.floor(angle / ig.util.pi2);
                angle = angle - n * ig.util.pi2;
                if (angle < 0) angle += ig.util.pi2;
                return angle;
            },

            collidingSquareCircle: function (square, circle) {
                var dx = Math.abs(circle.pos.x - (square.pos.x + square.half));
                var dy = Math.abs(circle.pos.y - (square.pos.y + square.half));
                var s = circle.r + square.half;

                if (dx > s || dy > s) {
                    return false;
                }

                var s2 = square.half - square.r;
                if (dx <= s2 || dy <= s2) {
                    return true;
                }
                var d = Math.sqrt(dx * dx + dy * dy);
                var d0 = Math.sqrt(2 * square.half * square.half) + circle.r;
                // var d0 = Math.sqrt(2 * s2 * s2) + square.r+ circle.r;
                return d < d0;
            },
        }

        ig.drawUtil = {
            fontStyle: function (font, color, align) {
                var c = ig.system.context;
                c.font = font;
                c.fillStyle = color;
                c.textAlign = align;
            },
            strokeStyle: function (color, lineWidth) {
                var c = ig.system.context;
                c.strokeStyle = color;
                c.lineWidth = lineWidth;
            },

            drawTextShadow: function (text, x, y) {
                ig.system.context.fillText(text, x, y);
                ig.system.context.fillStyle = "rgba(0,0,0,0.8)";
                ig.system.context.fillText(text, x + 3, y + 3);
            },

            clearScreen: function (color) {
                var c = ig.system.context;
                c.fillStyle = color;
                c.clearRect(0, 0, ig.system.width, ig.system.height);
            },
            fillScreen: function (color) {
                var c = ig.system.context;
                c.fillStyle = color;
                c.fillRect(0, 0, ig.system.width, ig.system.height);
            },
            roundRect: function (x, y, w, h, r) {
                // if (w < 2 * r) r = w / 2;
                // if (h < 2 * r) r = h / 2;
                var c = ig.system.context;
                c.beginPath();
                c.moveTo(x + r, y);
                c.arcTo(x + w, y, x + w, y + h, r);
                c.arcTo(x + w, y + h, x, y + h, r);
                c.arcTo(x, y + h, x, y, r);
                c.arcTo(x, y, x + w, y, r);
                c.closePath();
                c.stroke();
                c.fill();
                return c;
            },
            roundRectNoStroke: function (x, y, w, h, r) {
                // if (w < 2 * r) r = w / 2;
                // if (h < 2 * r) r = h / 2;
                var c = ig.system.context;
                c.beginPath();
                c.moveTo(x + r, y);
                c.arcTo(x + w, y, x + w, y + h, r);
                c.arcTo(x + w, y + h, x, y + h, r);
                c.arcTo(x, y + h, x, y, r);
                c.arcTo(x, y, x + w, y, r);
                c.closePath();
                // c.stroke();
                c.fill();
                return c;
            }
        }

        EntityOverlay = ig.Entity.extend({
            zIndex: 100,
            alpha: 0,

            fadeOut: function () {
                this.alpha = 1;
                this.tween({
                    alpha: 0
                }, 0.2, {
                    onComplete: function () {
                        this.kill();
                    }.bind(this)
                }).start();
            },

            fadeIn: function (cb) {
                this.alpha = 0;
                this.tween({
                    alpha: 1
                }, 0.2, {
                    onComplete: function () {
                        if (typeof cb === "function") cb();
                    }.bind(this)
                }).start();
            },

            draw: function () {
                ig.drawUtil.fillScreen("rgba(0,0,0," + this.alpha + ")");
            }
        });

        ig.Director.inject({
            loadLevel: function (levelNumber, disableFade) {
                if(disableFade) {
                    this.loadLevelOri(levelNumber);
                } else {
                    var overlay = ig.game.spawnEntity(EntityOverlay, 0, 0);
                    overlay.fadeIn(function () {
                        overlay.kill();
                        this.loadLevelOri(levelNumber);
                        overlay = ig.game.spawnEntity(EntityOverlay, 0, 0);
                        overlay.fadeOut();
                    }.bind(this));
                }
                return true;
            },

            loadLevelOri: function (levelNumber) {
                var divs = ig.Fullscreen.divs;
                for (var key in divs) {
                    var div = ig.domHandler.getElementById("#" + key);
                    ig.domHandler.hide(div);
                }
                // hide dynamic clickable entities (branding,etc)
                for (var key in ig.sizeHandler.dynamicClickableEntityDivs) {
                    //console.log(key);
                    var div = ig.domHandler.getElementById("#" + key);
                    ig.domHandler.hide(div);
                }

                //Load a level by its position in this.levels array
                //and set the this.currentLevel to that position.
                this.currentLevel = levelNumber;
                this.game.loadLevel(this.levels[levelNumber]);
                return true;
            }
        });

    });