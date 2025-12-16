ig.module(
    'game.entities.ingame.player'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityPlayer = ig.Entity.extend({
        zindex: 50,

        collides: ig.Entity.COLLIDES.NONE,
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.B,
        
        angle: 0,
        playerAlpha: 1,
        // pivotOffsetX: positive = right of center, negative = left of center, 0 = center
        pivotOffsetX: -75,
        pivotOffsetY: 0,
        size: { x: 200, y: 170 }, 
        maxVel: { x: 2000, y: 2000 },
        speedY: 900,
        speedX: 900,
        direction: 0, // -1: up, 1: down
        immune: false,
        reposing: false,

        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.size = _SHAPE_VERTICES.player.size;
            this.vertices = _SHAPE_VERTICES.player.vertices;

            this.trail = [];
            this.trailLength = 120;

            this.pivotOffsetX = this.vertices[1].x;
            this.pivotOffsetY = this.vertices[0].y;     
            this.offSize = this.vertices[2].y;       

            this.updatedVertices = [];
            this.updateVerticesCenterAngle();

            
            this.repos();
        },  
        update: function() {
            this.parent();
            this.updateCamera();
            
            this.vel.x = 0;

            if (this.hitEffectTimer && this.hitEffectTimer > 0) {
                this.hitEffectTimer -= ig.system.tick;
                if (this.hitEffectTimer <= 0) {
                    this.kill();
                }
            }

            if (ig.game.controller.isPaused) {
                this.updateVerticesCenterAngle();
                return;
            }
            if (!ig.game.controller.gameStarted || this.reposing) return;

            this.vel.x = this.speedX;

            var minY = this.border.top + this.offSize + ig.game.screen.y;
            var maxY = this.border.bottom - this.offSize + ig.game.screen.y;
            if (this.pos.y < minY) {
                this.pos.y = minY;
                this.updateDirection(0);
            } else if (this.pos.y > maxY) {
                this.pos.y = maxY;
                this.updateDirection(0);
            }

            if (ig.input.pressed('click')) {
                this.updateDirection(-1);
            } else if (ig.input.released('click')) {
                this.updateDirection(1);
            }

            this.updateVerticesCenterAngle();
        },

        updateDirection: function(dir) {
            this.direction = dir;
            this.vel.y = dir * this.speedY;

            if (this.vel.x != 0 || this.vel.y != 0) {
                if(dir != 0) {
                    if(ig.soundHandler.sfxPlaying('swipe'))
                        ig.soundHandler.sfxPlayer.stop('swipe');
                    ig.soundHandler.sfxPlayer.play('swipe');
                    
                }
                
                this.angle = Math.atan2(this.vel.y, this.vel.x);
            } else {
                this.angle = 0;
            }
        },

        updateVerticesCenterAngle: function() {
            var pivotX = this.pivotOffsetX || 0;
            var pivotY = this.pivotOffsetY || 0;
            this.updatedVertices = [];
            this._updatedVertices = [];
            for (var i = 0; i < this.vertices.length; i++) {
                var v = this.vertices[i];
                // Translate to pivot
                var relX = v.x - pivotX;
                var relY = v.y - pivotY;
                // Rotate
                var rotX = relX * Math.cos(this.angle) - relY * Math.sin(this.angle);
                var rotY = relX * Math.sin(this.angle) + relY * Math.cos(this.angle);
                // Translate back
                var finalX = rotX + pivotX;
                var finalY = rotY + pivotY;
                this.updatedVertices.push({
                    x: finalX,
                    y: finalY
                });
                this._updatedVertices.push({
                    x: this.center().x - ig.game.screen.x + finalX,
                    y: this.center().y - ig.game.screen.y + finalY
                });
            }

            if(this.reposing || ig.game.controller.isGameOver) return;
            var tail1 = this._updatedVertices[1];
            var tail2 = this._updatedVertices[2];
            this.trail.push({
                x: (tail1.x + tail2.x) / 2 + ig.game.screen.x,
                y: (tail1.y + tail2.y) / 2 + ig.game.screen.y
            });
            if (this.trail.length > this.trailLength) this.trail.shift();
        },

        satChecking: function (ver1, ver2) {
            // var s1 = new ig.SAT.Shape(ver1);
            // var s2 = new ig.SAT.Shape(ver2)

            // var result = ig.game.sat.simpleShapeIntersect(s2, s1);
            this.pc = new PolygonCollider(ver1, ver2);
            var result = this.pc.collide();
            return result;
        },

        isCollideHorizontalFace: function(ver1, ver2) {
            var pc = new PolygonCollider(ver1, ver2);
            var result = pc.getAllContactEdges();
            
            if (!result || result.length == 0) return false;
            
            for (var i = 0; i < result.length; i++) {
                var edge = result[i];
                // Check if the edge is horizontal
                if (edge[0].y != edge[1].y) {
                    return false;
                }
            }
            return true;
        },

        check: function(other) {
            if (this.isSliding && other.isSliding && this.center().x + this.pivotOffsetX > other.pos.x + other.size.x + 30) {
                var dir = 1
                if(ig.input.state('click')) dir = -1;
                this.updateDirection(dir);
                this.isSliding = false;
                other.isSliding = false;
            }     
            if (this.satChecking(this._updatedVertices, other._updatedVertices)) {
                if(this.isCollideHorizontalFace(this._updatedVertices, other._updatedVertices)) {
                    this.isSliding = true;
                    other.isSliding = true;
                    var off = 23
                    if(this.direction > 0) {
                        this.pos.y = other.pos.y - this.size.y/2 - this.offSize - off;
                    } else {
                        this.pos.y = other.pos.y + other.size.y - this.size.y/2 + this.offSize + off;
                    }
                    this.updateDirection(0);
                } else {
                    if (this.immune || ig.game.controller.isGameOver) return;  
                    ig.soundHandler.sfxPlayer.play('hit');
                    ig.soundHandler.stopBGM();
                    this.hitEffectTimer = 0.8;
                    this.hitEffectAlpha = 0;
                    this.vel.x = 0;
                    this.vel.y = 0;
                    ig.game.controller.gameOver();  
                }
            }
        },
        tweenEnd: function(des) {
            if (ig.game.controller.isPaused) return;
            ig.game.controller.isPaused = true;
            this.vel.x = 0;
            this.vel.y = 0;
            // this.trail = [];
            this.tween({
                angle: this.angle + Math.PI * 2,
                pos: { x: des.x, y: des.y },
                playerAlpha: 0.2
            }, 1, {
                onComplete: function() {
                    // ig.game.score += ig.game.level * 100;
                    var level = ig.game.level;
                    if(_MAP_SETTINGS['level'+(level+1)]) ig.game.level++
                    else ig.game.level = 1;
                    
    				ig.game.director.jumpTo(LevelIngame);
                }.bind(this)
            }).start();
        },

        updateCamera: function() {
            var targetX = this.pos.x - (ig.system.width - this.size.x) / 3;
            if (ig.game.controller && ig.game.controller.gate) {
                var gate = ig.game.controller.gate;
                var gateScreenX = gate.pos.x + gate.size.x - ig.game.screen.x;
                if (gateScreenX < ig.system.width) {
                    targetX = ig.game.screen.x;
                }
            }
            ig.game.screen.x = ig.util.lerp(ig.game.screen.x, targetX, 1);
        },

        draw: function() {
            this.parent();
            var ctx = ig.system.context;
            // if(this.pc) this.pc.drawDebug()
            ctx.save();
            if (this.trail.length > 1) {
                ctx.beginPath();
                for (var i = 0; i < this.trail.length; i++) {
                    var t = this.trail[i];
                    var px = t.x - ig.game.screen.x;
                    var py = t.y - ig.game.screen.y;
                    if (i == 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.strokeStyle = "#ffffff";
                ctx.globalAlpha = 0.7;
                ctx.lineWidth = 30;
                ctx.stroke();
            }
            ctx.restore();

            var flash = 1;
            if (this.hitEffectTimer && this.hitEffectTimer > 0) {
                flash = Math.abs(Math.sin(ig.system.clock.delta()*10));
            } else {
                flash = this.playerAlpha;
            }

            ctx.save();
            ctx.translate(this.center().x - ig.game.screen.x, this.center().y - ig.game.screen.y);
            ctx.beginPath();
            ctx.moveTo(this.updatedVertices[0].x, this.updatedVertices[0].y);
            ctx.lineTo(this.updatedVertices[1].x, this.updatedVertices[1].y);
            ctx.lineTo(this.updatedVertices[2].x, this.updatedVertices[2].y);
            ctx.closePath();

            ctx.fillStyle = "#000000";
            ctx.fill();
            ctx.globalAlpha = flash.toFixed(2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            // ctx.strokeStyle = "#ffffff";
            // ctx.lineWidth = 3;
            // ctx.lineJoin = "round";
            // ctx.stroke();
            ctx.restore();
        },
        kill: function() {
            ig.soundHandler.sfxPlayer.play('explosion');
            ig.game.spawnEntity(ig.EntityExplosion, this.pos.x + this.size.x/2, this.pos.y + this.size.y/2);
            this.parent();
        },
        repos: function() {
            this.border = {
                top: ig.game.controller.mapArea.top - this.size.y / 2,
                bottom: ig.game.controller.mapArea.bottom - this.size.y / 2
            };
            this.vel.x = 0;
            this.vel.y = 0;
            
            this.reposing = true;
            this.tween({}, 0.1, {
                onComplete: function() {
                    this.reposing = false;
                }.bind(this)
            }).start();
        }
    });

    ig.EntityExplosion = ig.Entity.extend({
        lifetime: 0.8,
        particles: 40,
        explosionSize: 1500,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            for (var i = 0; i < this.particles; i++) {
                ig.game.spawnEntity(ig.EntityParticle, x, y, {
                    vel: {
                        x: (Math.random() - 0.5) * this.explosionSize,
                        y: (Math.random() - 0.5) * this.explosionSize
                    },
                    lifetime: this.lifetime * Math.random()
                });
            }
            this.kill();
        }
    });

    ig.EntityParticle = ig.Entity.extend({
        size: { x: 20, y: 20 },
        lifetime: 0.5,
        fadetime: 0.5,
        vel: { x: 0, y: 0 },
        maxVel: { x: 2000, y: 2000 },
        alpha: 1,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.timer = new ig.Timer();
            this.size = {
                x: 5 + Math.random() * 50,
                y: 5 + Math.random() * 50
            }
        },
        update: function () {
            this.parent();
            if (this.timer.delta() > this.lifetime) {
                this.kill();
                return;
            }
            this.alpha = 1 - (this.timer.delta() / this.fadetime);
        },
        draw: function () {
            var ctx = ig.system.context;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, this.size.x, this.size.y);
            ctx.restore();
        }
    });
});
