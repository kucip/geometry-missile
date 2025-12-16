ig.module(
    'plugins.box2d.entity'
)
.requires(
    'impact.entity',
    'plugins.box2d.game'
)
.defines(function () {


    ig.Box2DEntity = ig.Entity.extend({
        body: null,
        angle: 0,
        box2dType: null, // entity shape 0 polygon , 1 circle , 2 custom
        dynamicType: null, // entity collision type 0 dynamice , 1 kinematic , 2 static
        density: null, //entiy density
        friction: null, //entiy friction
        restitution: null, //entiy restitution
        rotate: 0, //rotate entity

        previousBodyPosition: {
            x: 0,
            y: 0
        },
        previousBodyAngle: 0,

        slowTime: 0,

        init: function (x, y, settings) {
            this.parent(x, y, settings);
                        //    Only create a box2d body when we are not in Weltmeister
                        //    if (!ig.global.wm) {
                        //        this.createBody();
                        //    }
            
                        //    if (this.rotate > 0) {
                        //        this.angle = this.rotate * Math.PI / 180;
                        //    }
        },

        ready: function () {
            // Only create a box2d body when we are not in Weltmeister
            if (!ig.global.wm) {
                this.createBody();
            }

            if (this.rotate > 0) {
                this.angle = this.rotate * Math.PI / 180;
            }
        },

        createBody: function () {
            if (this.body) {
                var p = this.body.GetPosition();
                this.pos = {
                    x: (p.x / Box2D.SCALE - this.size.x / 2),
                    y: (p.y / Box2D.SCALE - this.size.y / 2)
                };
            }
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.position = new Box2D.Common.Math.b2Vec2(
                (this.pos.x + this.size.x / 2) * Box2D.SCALE,
                (this.pos.y + this.size.y / 2) * Box2D.SCALE
            );

            this.previousBodyPosition = {
                x: bodyDef.position.x,
                y: bodyDef.position.y
            }

            if (this.rotate) {
                bodyDef.angle = this.rotate * Math.PI / 180;
            }

            this.previousBodyAngle = bodyDef.angle;

            //setup entity collision type
            if (this.dynamicType == null || this.dynamicType == 0) {
                bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            } else if (this.dynamicType == 1) {
                bodyDef.type = Box2D.Dynamics.b2Body.b2_kinematicBody;
            } else if (this.dynamicType == 2) {
                bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
            }
            this.body = ig.world.CreateBody(bodyDef);    
            if (this.body == null) {
                ig.world.Step();
                this.body = ig.world.CreateBody(bodyDef);
            }
            this.body.entity = this;

            //setup collision layer
            this.fixture = new Box2D.Dynamics.b2FixtureDef;
            var fixture = this.fixture;

            if (this.box2dType == null || this.box2dType == 0) {
                //polygon
                fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
                fixture.shape.SetAsBox(
                    this.size.x / 2 * Box2D.SCALE,
                    this.size.y / 2 * Box2D.SCALE
                );
            } else if (this.box2dType == 1) {
                //circle
                fixture.shape = new Box2D.Collision.Shapes.b2CircleShape();
                fixture.shape.SetRadius(this.size.x / 2 * Box2D.SCALE);
            } else if (this.box2dType == 2) {
                //custom
                fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
                fixture.shape.SetAsArray(this.vertices, this.vertices.length);
            }

            //setup entity density
            if (this.density) {
                fixture.density = this.density;
            }

            //setup entity friction
            if (this.friction) {
                fixture.friction = this.friction;
            }

            //setup entity restitution
            if (this.restitution) {
                fixture.restitution = this.restitution;
            }

            //fixture.filter.categoryBits = 3 ;
            //fixture.filter.maskBits = 3 ;

            this.body.CreateFixture(fixture);
            this.body.SetUserData(this);
        },

        //original template
        //createBody: function() {
        //	var bodyDef = new Box2D.Dynamics.b2BodyDef();
        //	bodyDef.position = new Box2D.Common.Math.b2Vec2(
        //		(this.pos.x + this.size.x / 2) * Box2D.SCALE,
        //		(this.pos.y + this.size.y / 2) * Box2D.SCALE
        //	);
        //	bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        //	this.body = ig.world.CreateBody(bodyDef);
        //
        //	var fixture = new Box2D.Dynamics.b2FixtureDef;
        //	fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
        //	fixture.shape.SetAsBox(
        //		this.size.x / 2 * Box2D.SCALE,
        //		this.size.y / 2 * Box2D.SCALE
        //	);
        //
        //	fixture.density = 1.0;
        //	// fixture.friction = 0.5;
        //	// fixture.restitution = 0.3;
        //
        //	this.body.CreateFixture(fixture);
        //},

        update: function () {
            var p = this.body.GetPosition();
            this.previousBodyPosition = {
                x: this.pos.x,
                y: this.pos.y
            }
            this.pos = {
                x: (p.x / Box2D.SCALE - this.size.x / 2),
                y: (p.y / Box2D.SCALE - this.size.y / 2)
            };

            this.previousBodyAngle = this.angle;
            this.angle = this.body.GetAngle().round(2);

            if (this.currentAnim) {
                this.currentAnim.update();
                this.currentAnim.angle = this.angle;
            }

            if (this.tweens.length > 0) {
                var currentTweens = [];
                for (var i = 0; i < this.tweens.length; i++) {
                    this.tweens[i].update();
                    if (!this.tweens[i].complete) currentTweens.push(this.tweens[i]);
                }
                this.tweens = currentTweens;
            }
        },

        // Called when two fixtures begin to touch.
        beginContact: function (other, contact, argument) {},

        // Called when two fixtures cease to touch.
        endContact: function (other, contact, argument) {},

        // This lets you inspect a contact after the solver is finished.
        postSolve: function (other, contact, argument) {},

        // This is called after a contact is updated.
        preSolve: function (other, contact, argument) {},

        processCollisionQueues: function () {
            // Preserve Impact's entity checks.
            for (var id in this.checkQueue) {
                var other = this.checkQueue[id];
                if (this.entityContactCount[id] > 0) {
                    this.check(other);
                } else {
                    delete this.checkQueue[id];
                }
            }
            // Preserve Impact's collideWith calls.
            for (var axis in this.collideQueue) {
                for (var id in this.collideQueue[axis]) {
                    var other = this.collideQueue[axis][id];
                    this.collideWith(other, axis);
                    delete this.collideQueue[axis][id];
                }
            }
        },

        kill: function () {
            if (this.body) {
                ig.game.queueDestroyBody(this.body);
            }

            //ig.world.DestroyBody( this.body );
            this.parent();
        },

        setScale: function (x, y) {
            this.parent(x, y);
            if (this.body != null && this.scaleChange) {
                ig.world.DestroyBody(this.body);
                this.createBody();
                this.scaleChange = false;
            }
        }
    });

});