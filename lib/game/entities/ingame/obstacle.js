ig.module(
    'game.entities.ingame.obstacle'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityObstacle = ig.Entity.extend({
        zindex: 1,

        collides: ig.Entity.COLLIDES.NONE,
        type: ig.Entity.TYPE.B,

        size: { x: 900, y: 900 },
        maxVel: { x: 0, y: 0 },
        speedX: 600,
        angle: 0,
        updatedVertices: [],
        init: function(x, y, settings) {
            this.parent(x, y, settings);

            this.scale = settings.scale;
            this.flip = settings.flip;
            
            this.setupObstacle();
            this.updatedVertices = [];
            this.updateVerticesCenterAngle();
            ig.game.sortEntitiesDeferred();            
        },
        setupObstacle: function() {  
            var originalSize = _SHAPE_VERTICES.obstacles[this.shapeType].size;
            this.size = { x: originalSize.x * this.scale.x, y: originalSize.y * this.scale.y };
            this.initVertices();
            this.setPosition();
        },

        isCounterClockwise: function(vertices) {
            var sum = 0;
            for (var i = 0; i < vertices.length; i++) {
                var v1 = vertices[i];
                var v2 = vertices[(i + 1) % vertices.length];
                sum += (v2.x - v1.x) * (v2.y + v1.y);
            }
            return sum < 0; // true: counter-clockwise, false: clockwise
        },
        
        initVertices: function() {
            this.vertices = [];
            var origVerts = _SHAPE_VERTICES.obstacles[this.shapeType].vertices;
            for (var i = 0; i < origVerts.length; i++) {
                this.vertices.push({ x: origVerts[i].x * this.scale.x * this.flip.x, y: origVerts[i].y * this.scale.y * this.flip.y });
            }
            // Ensure vertices are in counter-clockwise order
            if(!this.isCounterClockwise(this.vertices)) {
                this.vertices.reverse();
            }
            
        },
        
        setPosition: function() {
            this.pivot = this.center();
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
            this.pivot = this.center();
            this.updateVerticesCenterAngle();
        },

        update: function() {            
            this.parent();
            // this.pos.x -= this.speedX * ig.system.tick;
            this.updateVerticesCenterAngle();
            if (this.pos.x + this.size.x < ig.game.screen.x - 500 && !ig.game.editorMode) {
                this.kill();
            }
        },
        updateVerticesCenterAngle: function() {
            this.updatedVertices = [];
            this._updatedVertices = [];
            for (var i = 0; i < this.vertices.length; i++) {
                var v = this.vertices[i];
                this.updatedVertices.push({
                    x: v.x * Math.cos(this.angle) - v.y * Math.sin(this.angle),
                    y: v.x * Math.sin(this.angle) + v.y * Math.cos(this.angle)
                });
                this._updatedVertices.push({
                    x: this.pivot.x - ig.game.screen.x + this.updatedVertices[i].x,
                    y: this.pivot.y - ig.game.screen.y + this.updatedVertices[i].y
                });
            }
        },
        draw: function() {
            this.parent();
            var ctx = ig.system.context;
            ctx.save();
            ctx.translate(this.pivot.x - ig.game.screen.x, this.pivot.y - ig.game.screen.y);

            ctx.beginPath();
            ctx.moveTo(this.updatedVertices[0].x, this.updatedVertices[0].y);
            for (var i = 1; i < this.updatedVertices.length; i++) {
                ctx.lineTo(this.updatedVertices[i].x, this.updatedVertices[i].y);
            }
            ctx.closePath();

            ctx.fillStyle = "#000000";
            ctx.fill();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 8;
            ctx.stroke();
            
            ctx.clip();

            this.drawGrid(ctx, 200, ctx.strokeStyle, ctx.lineWidth);
            ctx.restore();
        },

        drawGrid: function(ctx, cellSize, color, lineWidth) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            var minX = -this.size.x/2;
            var maxX = this.size.x/2;
            var minY = -this.size.y/2;
            var maxY = this.size.y/2;
            for (var x = minX; x <= maxX; x += cellSize) {
                ctx.beginPath();
                ctx.moveTo(x, minY);
                ctx.lineTo(x, maxY);
                ctx.stroke();
            }
            for (var y = minY; y <= maxY; y += cellSize) {
                ctx.beginPath();
                ctx.moveTo(minX, y);
                ctx.lineTo(maxX, y);
                ctx.stroke();
            }
            ctx.restore();
        },
        kill: function() {
            this.parent();
        },
        repos: function() {
            this.setPosition();
            this.updateVerticesCenterAngle();
        },
    });
});
