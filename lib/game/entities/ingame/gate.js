ig.module(
    'game.entities.ingame.gate'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityGate = ig.Entity.extend({
        zindex: 2,
        checkAgainst: ig.Entity.TYPE.A,
        size: { x: 600, y: 400 },
        center: { x: 0, y: 0 },
        particles: [],
        particleCount: 32,
        particleSize: 18,
        particleSpeed: 1000,
        particleSpawnRadius: 0,
        particleColor: '#ffeb3b',
        gateColor: '#d32f2f',
        borderColor: '#fff',
        borderWidth: 10,
        shapeType: 'gate',
        init: function(x, y, settings) {
            this.parent(x, y, settings);
            if(settings && settings.size) {
                this.size = settings.size;
            }
            this.center = {
                x: this.size.x / 2,
                y: this.size.y / 2
            };
            this.particleSpawnRadius = Math.max(this.size.x, this.size.y) / 2;
            this.spawnParticles();
            ig.game.sortEntitiesDeferred();
        },
        underPointer: function () {
            var p = {
                x: ig.input.mouse.x + ig.game.screen.x,
                y: ig.input.mouse.y + ig.game.screen.y
            };
            return this.containPoint(p);
        },

        dragging: function() {
            if(!ig.game.editorMode) return;

            var mouseX = ig.input.mouse.x + ig.game.screen.x;
            var mouseY = ig.input.mouse.y + ig.game.screen.y;

            this.pos.x = Math.round(mouseX / 100) * 100 - this.size.x / 2;
            this.pos.y = Math.round(mouseY / 100) * 100 - this.size.y / 2;

        },
        spawnParticles: function() {
            this.particles = [];
            for(var i=0; i<this.particleCount; i++) {
                var angle = Math.random() * Math.PI * 2;
                var r = this.particleSpawnRadius;
                var px = this.center.x + Math.cos(angle) * r;
                var py = this.center.y + Math.sin(angle) * r;
                this.particles.push({
                    x: px,
                    y: py,
                    angle: angle,
                    progress: 0,
                    speed: this.particleSpeed + Math.random()*40
                });
            }
        },
        update: function() {
            this.parent();
            // update particles
            for(var i=0; i<this.particles.length; i++) {
                var p = this.particles[i];

                var dx = p.x - this.center.x;
                var dy = p.y - this.center.y;
                var dist = Math.sqrt(dx*dx + dy*dy);
                if(dist > 4) {
                    p.angle += (Math.random()-0.5) * 0.08;

                    var moveDist = ig.system.tick * p.speed;
                    var moveX = -dx/dist * moveDist + Math.sin(p.angle) * 2;
                    var moveY = -dy/dist * moveDist + Math.cos(p.angle) * 2;

                    moveX += (Math.random()-0.5) * 1.5;
                    moveY += (Math.random()-0.5) * 1.5;
                    p.x += moveX;
                    p.y += moveY;
                } else {
                    var angle = Math.random() * Math.PI * 2;
                    var r = this.particleSpawnRadius;
                    p.x = this.center.x + Math.cos(angle) * r;
                    p.y = this.center.y + Math.sin(angle) * r;
                    p.angle = angle;
                    p.speed = this.particleSpeed + Math.random()*40;
                }
            }
        },
        check: function(other) {
            var des = {
                x: this.pos.x + this.center.x,
                y: this.pos.y + this.center.y
            }
            other.tweenEnd(des);
        },
        draw: function() {
            var ctx = ig.system.context;
            ctx.save();
            ctx.translate(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y);

            for(var i=0; i<this.particles.length; i++) {
                var p = this.particles[i];
                if(p.x < this.center.x && p.x >= 0 && p.x <= this.size.x && p.y >= 0 && p.y <= this.size.y) {
                    ctx.save();
                    ctx.globalAlpha = 0.7;
                    ctx.fillStyle = this.particleColor;

                    var dx = p.x - this.center.x;
                    var dy = p.y - this.center.y;
                    var dist = Math.sqrt(dx*dx + dy*dy);
                    var minSize = 6;
                    var size = minSize + (this.particleSize-minSize) * (dist/this.particleSpawnRadius);
                    ctx.fillRect(p.x-size/2, p.y-size/2, size, size);
                    ctx.restore();
                }
            }

            ctx.fillStyle = '#000';
            ctx.fillRect(this.center.x*0.9, 0, this.size.x - this.center.x, this.size.y);

            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = this.borderWidth;
            ctx.strokeRect(this.center.x*0.9, 0, this.center.x, this.size.y);

            ctx.restore();
        },
        repos: function() {

        },
    });
});
