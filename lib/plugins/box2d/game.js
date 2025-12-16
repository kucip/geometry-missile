ig.module(
	'plugins.box2d.game'
)
.requires(
	'plugins.box2d.lib',
	'impact.game'
)
.defines(function(){

    var SEGMENT_A = 1;
    var SEGMENT_B = 2;

ig.Box2DGame = ig.Game.extend({

	collisionRects: [],
	debugCollisionRects: false,

	worldVelocityIterations: 6,
	worldPositionIterations: 6,

	updateTimestep: 1/60,
	updateTimestepAccumulator: 0,
	updateTimestepAccumulatorRatio: 0,
	lastUpdateTime: -1,
	nWorldSteps: 0,

	bodyDestroyQueue: [],

	defaultTileSegmentsDef: {},
	defaultTileVerticesDef: {},

	loadLevel: function( data ) {
/*	Original


		// Find the collision layer and create the box2d world from it
		for( var i = 0; i < data.layer.length; i++ ) {
			var ld = data.layer[i];
			if( ld.name == 'collision' ) {
				ig.world = this.createWorldFromMap( ld.data, ld.width, ld.height, ld.tilesize );
				break;
			}
		}

		this.parent( data );
*/
		// patch for weltmeister slope tiles
        this.collisionMap = ig.CollisionMap.staticNoCollision;
        for(var i=0; i<data.layer.length; i++) {
            var ld = data.layer[i];
            if(ld.name == 'collision') {
                this.collisionMap =
                    new ig.CollisionMap(ld.tilesize, ld.data);
            }
        }



        this.mergedShape=this.mergeRectangles(this.collisionMap);
        ig.world = this.createWorldFromCollisionMap(this.collisionMap,this.mergedShape);
        this.setupContactListener();
        this.parent(data);

	},


	createWorldFromMap: function( origData, width, height, tilesize ) {
		var worldBoundingBox = new Box2D.Collision.b2AABB();
		worldBoundingBox.lowerBound.Set( 0, 0 );
		worldBoundingBox.upperBound.Set(
			(width + 1) * tilesize * Box2D.SCALE,
			(height + 1) * tilesize  * Box2D.SCALE
		);

		var gravity = new Box2D.Common.Math.b2Vec2( 0, ig.game.gravity * Box2D.SCALE );
		world = new Box2D.Dynamics.b2World( gravity, true );


		// We need to delete those tiles that we already processed. The original
		// map data is copied, so we don't destroy the original.
		var data = ig.copy( origData );

		// Get all the Collision Rects from the map
		this.collisionRects = [];
		for( var y = 0; y < height; y++ ) {
			for( var x = 0; x < width; x++ ) {
				// If this tile is solid, find the rect of solid tiles starting
				// with this one
				if( data[y][x] ) {
					var r = this._extractRectFromMap( data, width, height, x, y );
					this.collisionRects.push( r );
				}
			}
		}

		// Go through all rects we gathered and create Box2D objects from them
		for( var i = 0; i < this.collisionRects.length; i++ ) {
			var rect = this.collisionRects[i];

			var bodyDef = new Box2D.Dynamics.b2BodyDef();
			bodyDef.position.Set(
				rect.x * tilesize * Box2D.SCALE + rect.width * tilesize / 2 * Box2D.SCALE,
				rect.y * tilesize * Box2D.SCALE + rect.height * tilesize / 2 * Box2D.SCALE
			);

			var body = world.CreateBody( bodyDef );
			var shape = new Box2D.Collision.Shapes.b2PolygonShape();
			shape.SetAsBox(
				rect.width * tilesize / 2 * Box2D.SCALE,
				rect.height * tilesize / 2 * Box2D.SCALE
			);
			body.CreateFixture2( shape );
		}

		return world;
	},


	_extractRectFromMap: function( data, width, height, x, y ) {
		var rect = {x: x, y: y, width: 1, height: 1};

		// Find the width of this rect
		for(var wx = x + 1; wx < width && data[y][wx]; wx++ ) {
			rect.width++;
			data[y][wx] = 0; // unset tile
		}

		// Check if the next row with the same width is also completely solid
		for( var wy = y + 1; wy < height; wy++ ) {
			var rowWidth = 0;
			for( wx = x; wx < x + rect.width && data[wy][wx]; wx++ ) {
				rowWidth++;
			}

			// Same width as the rect? -> All tiles are solid; increase height
			// of this rect
			if( rowWidth == rect.width ) {
				rect.height++;

				// Unset tile row from the map
				for( wx = x; wx < x + rect.width; wx++ ) {
					data[wy][wx] = 0;
				}
			}
			else {
				return rect;
			}
		}
		return rect;
	},


	update: function() {
		if(!ig.game.box2dPaused){
			if(ig.world){ // <------ for level without background layer , else will pop up error
				var dt = ig.system.clock.delta() - this.lastUpdateTime;
				this.lastUpdateTime = ig.system.clock.delta();

				var MAX_STEPS = 5;
				this.updateTimestepAccumulator += dt;
				this.nWorldSteps = Math.floor(this.updateTimestepAccumulator / this.updateTimestep);

				if(this.nWorldSteps > 0) {
					this.updateTimestepAccumulator -= this.nWorldSteps * this.updateTimestep;
				}
				this.updateTimestepAccumulatorRatio = this.updateTimestepAccumulator / this.updateTimestep;

				var nStepsClamped = Math.min(this.nWorldSteps, MAX_STEPS);

				for(var i=0; i<nStepsClamped; i++){
					this.resetSmoothStates();
					ig.world.Step(
						this.updateTimestep,
						this.worldVelocityIterations,
						this.worldPositionIterations
					);

					//look for slow bodies and put them to sleep
					for (var b = ig.world.GetBodyList(); b; b = b.m_next) {
						if(!b.IsAwake()) continue;
						var f = b.GetFixtureList();
						if(f && f.IsSensor()) continue;

						var slowAngularV = Math.abs(b.GetAngularVelocity()) < 0.6;
						var slowLinearV = Math.abs(b.GetLinearVelocity().Length()) < 0.6;

						if(slowAngularV && slowLinearV) {
							if(b.slowTime > 30) {
								b.slowTime = 0;
								b.SetAwake(false);
							} else {
								b.slowTime += 1;
							}
						} else {
							b.slowTime = 0;
						}
					}

				}
				ig.world.ClearForces();
				this.smoothStates();
			}
		}
		this.parent();

		if(this.bodyDestroyQueue.length > 0){
			for(var i=0; i<this.bodyDestroyQueue.length; i++){
				ig.world.DestroyBody( this.bodyDestroyQueue[i] );
			}
			this.bodyDestroyQueue = [];
		}

		/*
		for (var b = ig.world.GetBodyList(); b; b = b.m_next) {

		}
		*/
	},

	smoothStates: function() {
		var oneMinusRatio = 1 - this.updateTimestepAccumulatorRatio;

		for (var i=0; i<this.entities.length; i++) {
			var e = this.entities[i];

			if(e.body == null) continue;

			if(e.dynamicType == Box2D.Dynamics.b2Body.b2_staticBody) {
				continue;
			}

			e.pos.x = this.updateTimestepAccumulatorRatio * e.body.GetPosition().x + oneMinusRatio * e.previousBodyPosition.x;
			e.pos.y = this.updateTimestepAccumulatorRatio * e.body.GetPosition().y + oneMinusRatio * e.previousBodyPosition.y;

			e.angle = this.updateTimestepAccumulatorRatio * e.body.GetAngle() + oneMinusRatio * e.previousBodyAngle;

			if( e.currentAnim ) {
				e.currentAnim.update();
				e.currentAnim.angle = e.angle;
			}
		}
	},

	resetSmoothStates: function() {
		for (var i=0; i<this.entities.length; i++) {
			var e = this.entities[i];

			if(e.body == null) continue;

			if(e.dynamicType == Box2D.Dynamics.b2Body.b2_staticBody) {
				continue;
			}

			e.pos.x = e.body.GetPosition().x;
			e.previousBodyPosition.x = e.pos.x;
			e.pos.y = e.body.GetPosition().y;
			e.previousBodyPosition.y = e.pos.y;
			e.angle = e.body.GetAngle();
			e.previousBodyAngle = e.body.GetAngle();

			if( e.currentAnim ) {
				e.currentAnim.update();
				e.currentAnim.angle = e.angle;
			}
		}
	},

	draw: function() {
		this.parent();

		if( this.debugCollisionRects ) {
			// Draw outlines of all collision rects
			var ts = this.collisionMap.tilesize;
			for( var i = 0; i < this.collisionRects.length; i++ ) {
				var rect = this.collisionRects[i];
				ig.system.context.strokeStyle = '#00ff00';
				ig.system.context.strokeRect(
					ig.system.getDrawPos( rect.x * ts - this.screen.x ),
					ig.system.getDrawPos( rect.y * ts - this.screen.y ),
					ig.system.getDrawPos( rect.width * ts ),
					ig.system.getDrawPos( rect.height * ts )
				);
			}
		}
	},

	queueDestroyBody: function(body) {
		this.bodyDestroyQueue.push(body);


    },


	mergeRectangles: function(collisionMap) {



            if(collisionMap.data == undefined) return;
            var data = ig.copy(collisionMap.data);
            var fullMap = [];

            //create square map array
            for(var i = 0; i < data.length; i++) {


                    if(fullMap[i] == undefined) {

                            fullMap[i] = [];
                    }
                    for(var j = 0; j < data[0].length; j++) {

                            fullMap[i].push(0);

                    }
            }

            //fill squares
            var shapes = this._shapesFromCollisionMap(collisionMap);

            var finalShapes = [];

            var squares = [];


            for(var i = 0; i < shapes.length; i++) {

                    if(shapes[i].id == 1) {

                            squares.push(shapes[i]);

                            fullMap[shapes[i].tile.y][shapes[i].tile.x] = squares[squares.length - 1];



                    } else {


                            finalShapes.push(shapes[i]);

                    }

            }


            //get neighbours
            for(var i = squares.length - 1; i >= 0; i--) {

                    if(squares[i].id == 1) {

                            var x = squares[i].tile.x;
                            var y = squares[i].tile.y;

                            squares[i].neighbours = this.checkNeighbour(fullMap, x, y);

                    }
            }

            var mergedSquares = this.linkSquares(squares, fullMap);



            finalShapes = finalShapes.concat(mergedSquares);

            return finalShapes;

    },


    sideAbleCheck: function(arr,x,y,side){
        if(arr){
        if(arr[y]){
        if(arr[y][x]){


            if(arr[y][x].neighbours){

                if(arr[y][x].neighbours.indexOf(side)>-1){

                     return true;


                }else{

                     return false;

                }

            }else{

            return false;

            }

        }else{

        return false;

        }
        }else{

        return false;

        }
        }else{

        return false;
        }


    },



    linkSquares: function(squares, map) {


            var checked = [];
            var singleBlock = [];

            //loop through all rectangles and prioritize horizontal rectangles

            for(var i = 0; i < squares.length; i++) {


                    var currentSquare = squares[i];

                    var minX = currentSquare.tile.x;
                    var minY = currentSquare.tile.y;


                    if(checked.indexOf(currentSquare) > -1) continue;

                    checked.push(currentSquare);

                    if(currentSquare.neighbours.indexOf("right") > -1) {

                            var nextTileCount = 1;

                            while(this.sideAbleCheck(map, currentSquare.tile.x + nextTileCount, currentSquare.tile.y, "right") == true) {

                                    if(currentSquare.tile.x + nextTileCount < minX) {

                                            minX = currentSquare.tile.x + nextTileCount;
                                    }

                                    checked.push(map[currentSquare.tile.y][currentSquare.tile.x + nextTileCount]);
                                    nextTileCount++;

                            }

                            map[currentSquare.tile.y][minX].settings.size.x *= (nextTileCount + 1);

                            //stretch vertices scale

                            var vertices = map[currentSquare.tile.y][minX].settings.vertices;

                            for(var v = 0; v < vertices.length; v++) {

                                    vertices[v].x *= (nextTileCount + 1);

                            }

                            checked.push(map[currentSquare.tile.y][currentSquare.tile.x + nextTileCount + 1]);

                            singleBlock.push(map[currentSquare.tile.y][minX]);




                    } else if(currentSquare.neighbours.indexOf("down") > -1 && currentSquare.neighbours.indexOf("right") == -1 && currentSquare.neighbours.indexOf("left") == -1) {

                            if(currentSquare.tile.y + nextTileCount < minY) {


                                    minY = currentSquare.tile.y + nextTileCount;
                            }

                            var atLeastOneDown = 0;
                            var downTileCount = 1;

                            while(this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y + downTileCount, "down") == true &&
                                    this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y + downTileCount, "right") == false &&
                                    this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y + downTileCount, "left") == false) {

                                    atLeastOneDown = 1;
                                    checked.push(map[currentSquare.tile.y + downTileCount][currentSquare.tile.x]);
                                    downTileCount++;
                            }



                            if(this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y + downTileCount, "up") == true &&
                               this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y + downTileCount, "right") == false &&
                               this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y + downTileCount, "left") == false){

                                    atLeastOneDown = 1;


                            }else if(this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y + downTileCount, "up") == true &&
                               this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y + downTileCount, "right") == true){
                                checked.splice(checked.indexOf(map[currentSquare.tile.y + downTileCount][currentSquare.tile.x]),1);
                                downTileCount--;

                            }else if(this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y + downTileCount, "up") == true &&
                               this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y + downTileCount, "left") == true){
                                checked.splice(checked.indexOf(map[currentSquare.tile.y + downTileCount][currentSquare.tile.x]),1);
                                downTileCount--;


                            }




                            if(atLeastOneDown == 1) {
                                //if can go merge at least one tile, include extra tile into single block

                                    map[minY][currentSquare.tile.x].settings.size.y *= (downTileCount + 1);

                                    var vertices = map[minY][currentSquare.tile.x].settings.vertices
                                    for(var v = 0; v < vertices.length; v++) {
                                            vertices[v].y *= (downTileCount + 1);

                                    }

                                    if(map[currentSquare.tile.y + downTileCount]) {
                                            checked.push(map[currentSquare.tile.y + downTileCount][currentSquare.tile.x]);

                                    }

                            }

                            singleBlock.push(map[minY][currentSquare.tile.x]);


                    } else if(currentSquare.neighbours.indexOf("left") > -1) {


                    } else if(currentSquare.neighbours.indexOf("up") > -1) {



                         if(this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y-1, "down") == true){

                            if(this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y-1, "right") == true ||
                               this.sideAbleCheck(map, currentSquare.tile.x, currentSquare.tile.y-1, "left") == true){


                                checked.push(map[currentSquare.tile.y][currentSquare.tile.x]);
                            singleBlock.push(map[currentSquare.tile.y][currentSquare.tile.x]);

                            }
                            }




                    } else {


                            checked.push(map[currentSquare.tile.y][currentSquare.tile.x]);
                            singleBlock.push(map[currentSquare.tile.y][currentSquare.tile.x]);
                    }

            }

            return singleBlock;


    },


    getNeighbourTiles: function(arr,x,y,dir){


        switch(dir) {


                case "left":


                return [{x:x-1,y:y}];


                break;


                case "right":


                return [{x:x+1,y:y}];


                break;


                case "up":


                return [{x:x,y:y-1}];


                break;


                case "down":


                return [{x:x,y:y+1}];


                break;

                case "topL":


                return [{x:x,y:y-1},{x:x-1,y:y},{x:x-1,y:y-1}];


                break;


                case "topR":


                return [{x:x,y:y-1},{x:x+1,y:y},{x:x+1,y:y-1}];


                break;


                case "bottomL":


                return [{x:x,y:y+1},{x:x-1,y:y},{x:x-1,y:y+1}];


                break;


                case "bottomR":


                return [{x:x,y:y+1},{x:x+1,y:y},{x:x+1,y:y+1}];


                break;







                }




    },



    checkNeighbour: function(arr,x,y){
        var neighbours=[];


        if(this.checkArr(arr,(x-1),y)!=0){

        neighbours.push("left");

        }

        if(this.checkArr(arr,x,(y+1))!=0){

        neighbours.push("down");

        }


        if(this.checkArr(arr,(x+1),y)!=0){

        neighbours.push("right");

        }

        if(this.checkArr(arr,x,(y-1))!=0){

        neighbours.push("up");

        }




        return neighbours;


    },

    checkArr: function(arr,x,y){


    if(arr[y]==undefined){

    return 0;

    }else if(arr[y][x]==undefined){


    return 0;


    }else{

    return arr[y][x];

    }

    },

        createWorldFromCollisionMap: function(collisionMap,mergedShape) {
            // Gravity is applied to entities individually.
            var gravity = new Box2D.Common.Math.b2Vec2(0, 0);
			var gravity = new Box2D.Common.Math.b2Vec2( 0, ig.game.gravity * Box2D.SCALE );
			world = new Box2D.Dynamics.b2World( gravity, true );

            if(mergedShape!=undefined){

                var shapes =mergedShape;

            }else{

                var shapes = this._shapesFromCollisionMap(this.collisionMap);

            }
            for(var i=0; i<shapes.length; i++) {
                var shape = shapes[i];
                var width = shape.settings.size.x;
                var height = shape.settings.size.y;
                var vertices = shape.settings.vertices;

                var bodyDef = new Box2D.Dynamics.b2BodyDef();
                bodyDef.position.Set(
                    shape.x * Box2D.SCALE + (width / 2) * Box2D.SCALE,
                    shape.y * Box2D.SCALE + (height / 2) * Box2D.SCALE);
                var body = world.CreateBody(bodyDef);

                    var shape = new Box2D.Collision.Shapes.b2PolygonShape();
                    shape.SetAsArray(vertices, vertices.length);
                    body.CreateFixture2(shape);

            }
            return world;
        },

        setupContactListener: function() {
            var callback = function(method, contact, argument) {
                var a = contact.GetFixtureA().GetBody().entity;
                var b = contact.GetFixtureB().GetBody().entity;
                if(a && b) {
                    a[method](b, contact, argument);
                    b[method](a, contact, argument);
                } else if(a && !b) {
                    a[method](null, contact, argument);
                } else if(b && !a) {
                    b[method](null, contact, argument);
                }
            };
            var listener = new Box2D.Dynamics.b2ContactListener();
            listener.BeginContact = function(contact) {
                callback('beginContact', contact);
            };
            listener.EndContact = function(contact) {
                callback('endContact', contact);
            };
            listener.PostSolve = function(contact, impulse) {
                callback('postSolve', contact, impulse);
            };
            listener.PreSolve = function(contact, oldManifold) {
                callback('preSolve', contact, oldManifold);
            };
            ig.world.SetContactListener(listener);
        },

        _shapesFromCollisionMap: function (map, options) {
            var shapes = [];
            if (map instanceof ig.CollisionMap) {
                options = options || {};
                // copy data so we can clear spots we've already visited and used
                // data is edited as we go so we don't extract duplicates
                var data = ig.copy(map.data);
                // extract each tile shape from map
                var tilesize = map.tilesize;
                var width = map.width;
                var height = map.height;
                var vertices, scaledVertices, segments, segment;
                var ix, iy, x, y;
                var i, il, tile, shape;
                for (iy = 0; iy < height; iy++) {
                    for (ix = 0; ix < width; ix++) {
                        shape = this._shapeFromTile(map, ix, iy);
                        tile = {
                            id: map.data[ iy ][ ix ],
                            ix: ix,
                            iy: iy,
                            x: ix * tilesize,
                            y: iy * tilesize,
                            width: tilesize,
                            height: tilesize,
                            shape: shape
                        };
                        // not empty
                        if (shape.vertices.length > 0) {
                            // copy, absolutely position, and scale vertices
                            scaledVertices = [];
                            vertices = shape.vertices;
                            segments = shape.segments;
                            for (i = 0, il = segments.length; i < il; i++) {
                                segment = segments[ i ];
                                var va = vertices[ segment.a ];
                                var scaleFactor = {
                                    x: tile.width/20,
                                    y: tile.height/20
                                };
                                scaledVertices[ segment.a ] = {
                                    x: va.x.map(0,1,-scaleFactor.x,scaleFactor.x),
                                    y: va.y.map(0,1,-scaleFactor.y,scaleFactor.y)
                                };
                            }
                            shape.vertices = scaledVertices;
                            // add to list
                            if(
                                shape.vertices[shape.vertices.length-1].x === shape.vertices[0].x &&
                                shape.vertices[shape.vertices.length-1].y === shape.vertices[0].y
                            ) {
                                shape.vertices.pop();
                            }

                            var b2Shape = {
                                id: tile.id,
                                settings: {
                                    size: {
                                        x: tile.width,
                                        y: tile.height
                                    },
                                    vertices: ig.copy(shape.vertices)
                                },
                                x: tile.x,
                                y: tile.y,
                                tile: {
                                    x:ix,
                                    y:iy
                                }
                            };

                            shapes.push(b2Shape);
                        }
                        // store in copied data so other tiles can compare
                        data[ iy ][ ix ] = tile;
                    }
                }
            }
            return shapes;
        },

        _shapeFromTile: function (map, ix, iy) {
            var i, il;
            var tileId = map.data[ iy ][ ix ];
            var vertices = this._verticesFromTile(map, ix, iy);
            var segments;
            if (vertices) {
                // get or compute segments from tile
                if (this.defaultTileSegmentsDef[ tileId ]) {
                    segments = this.defaultTileSegmentsDef[ tileId ];
                }
                else {
                    this.defaultTileSegmentsDef[ tileId ] = segments = [];
                    for (i = 0, il = vertices.length; i < il; i++) {
                        var va = vertices[ i ];
                        var indexB = i === il - 1 ? 0 : i + 1;
                        var vb = vertices[ indexB ];
                        // store segment with pre-computed normal for later use
                        // normal should be facing out and normalized between 0 and 1
                        var dx = vb.x - va.x;
                        var dy = vb.y - va.y;
                        var l = Math.sqrt(dx * dx + dy * dy);
                        var nx = dy / l;
                        var ny = -dx / l;
                        segments.push({ a: i, b: indexB, normal: { x: nx, y: ny } });
                    }
                }
            }
            return {
                vertices: vertices,
                segments: segments || []
            };
        },

        _verticesFromTile: function (map, ix, iy) {
            var tileId = map.data[ iy ][ ix ];
            var vertices;
            // get or compute shape from tile
            if (this.defaultTileVerticesDef[ tileId ]) {
                vertices = this.defaultTileVerticesDef[ tileId ];
            }
            else {
                // solid square (1)
                if (tileId === 1) {
                    vertices = [
                        { x: 0, y: 0 },
                        { x: 1, y: 0 },
                        { x: 1, y: 1 },
                        { x: 0, y: 1 }
                    ];
                }
                // solid sloped
                else {
                    vertices = [];
                    // find vertices
                    var def = map.tiledef[ tileId ];
                    if (def) {
                        var va = vertices[ 0 ] = { x: def[0], y: def[1] };
                        var vb = vertices[ 1 ] = { x: def[2], y: def[3] };
                        var ax = va.x;
                        var ay = va.y;
                        var bx = vb.x;
                        var by = vb.y;
                        var fx = bx - ax;
                        var fy = by - ay;
                        // we have two points and the slope's facing direction
                        // find remaining points
                        // corner
                        var vc = vertices[ 2 ] = { x: ( fy < 0 ? 1 : 0 ), y: ( fx > 0 ? 1 : 0 ) };
                        var cx = vc.x;
                        var cy = vc.y;
                        var vd, ve, dax, day, dbx, dby;
                        // check if 5 sided
                        var fiveSided = false;
                        if (Math.abs(fx) < 1 && Math.abs(fy) < 1) {
                            var quadrantA = _utv2.pointQuadrant(ax, ay, 0.5, 0.5);
                            var quadrantB = _utv2.pointQuadrant(bx, by, 0.5, 0.5);
                            var quadrantC = _utv2.pointQuadrant(cx, cy, 0.5, 0.5);
                            if (!( quadrantA & quadrantC ) && !( quadrantB & quadrantC )) {
                                fiveSided = true;
                            }
                        }
                        if (fiveSided === true) {
                            // generate vertices in both directions from corner
                            if (cx !== cy) {
                                dax = cx;
                                dby = cy;
                                if (cx == 1) {
                                    day = 1;
                                    dbx = 0;
                                }
                                else {
                                    day = 0;
                                    dbx = 1;
                                }
                            }
                            else {
                                day = cy;
                                dbx = cx;
                                if (cx == 1) {
                                    dax = 0;
                                    dby = 0;
                                }
                                else {
                                    dax = 1;
                                    dby = 1;
                                }
                            }
                            vd = vertices[ 3 ] = { x: dax, y: day };
                            ve = vertices[ 4 ] = { x: dbx, y: dby };
                        }
                        else {
                            // check from corner to connected points
                            // generate d vertices in both directions for testing against a and b
                            if (cx !== cy) {
                                dax = cx;
                                dby = cy;
                                if (cx == 1) {
                                    day = Math.max(ay, by);
                                    dbx = Math.min(ax, bx);
                                }
                                else {
                                    day = Math.min(ay, by);
                                    dbx = Math.max(ax, bx);
                                }
                            }
                            else {
                                day = cy;
                                dbx = cx;
                                if (cx == 1) {
                                    dax = Math.min(ax, bx);
                                    dby = Math.min(ay, by);
                                }
                                else {
                                    dax = Math.max(ax, bx);
                                    dby = Math.max(ay, by);
                                }
                            }
                            // da is duplicate of a
                            if (( dax === ax && day === ay ) || ( dax === bx && day === by )) {
                                // db is not duplicate of b
                                if (!( ( dbx === ax && dby === ay ) || ( dbx === bx && dby === by ) )) {
                                    vd = vertices[ 3 ] = { x: dbx, y: dby };
                                }
                            }
                            else {
                                vd = vertices[ 3 ] = { x: dax, y: day };
                            }
                        }
                        vertices = this._pointsToConvexHull(vertices);
                    }
                    // store so we don't compute again
                    this.defaultTileVerticesDef[ tileId ] = vertices;
                }
            }
            return vertices;
        },

        _pointsToConvexHull: function (points) {
            if (points.length < 3) return points;
            // find the point with the smallest y
            var i, il;
            var indexMin = 0, pointMin = points[ indexMin ], point;
            for (i = 1, il = points.length; i < il; i++) {
                point = points[ i ];
                if (point.y === pointMin.y) {

                    if (point.x < pointMin.x) {
                        indexMin = i;
                        pointMin = point;
                    }

                }
                else if (point.y < pointMin.y) {
                    indexMin = i;
                    pointMin = point;
                }
            }
            // sort points by angle from min
            var pointsByAngle = [];
            var pointFromMin;
            for (i = 0, il = points.length; i < il; i++) {
                if (i === indexMin) continue;
                point = points[ i ];
                pointFromMin = { x: point.x, y: point.y };
                pointFromMin.angle = Math.atan(( point.y - pointMin.y ) / ( point.x - pointMin.x));
                if (pointFromMin.angle < 0) pointFromMin.angle += Math.PI;
                pointFromMin.distance = ( point.x - pointMin.x ) * ( point.x - pointMin.x ) + ( point.y - pointMin.y ) * ( point.y - pointMin.y );
                pointFromMin.index = i;
                pointsByAngle.push(pointFromMin);
            }
            pointsByAngle.sort(function (a, b) {
                if (a.angle < b.angle) return -1;
                else if (a.angle > b.angle) return 1;
                else {
                    if (a.distance < b.distance) return -1;
                    else if (a.distance > b.distance) return 1;
                }
                return 0;
            });
            // add last point and min point to beginning
            pointsByAngle.unshift( pointsByAngle[ pointsByAngle.length - 1 ], { x: pointMin.x, y: pointMin.y, index: indexMin } );
            // search for convex hull
            // loc is location, and at end of search the final index
            var pointTemp;
            var loc = 2;
            for (i = 3, il = points.length; i <= il; i++) {
                // find next valid point
                while (this._pointsCW(pointsByAngle[ loc - 1 ], pointsByAngle[ loc ], pointsByAngle[ i ]) <= 0) {
                    loc--;
                }
                loc++;
                pointTemp = pointsByAngle[ i ];
                pointsByAngle[ i ] = pointsByAngle[ loc ];
                pointsByAngle[ loc ] = pointTemp;
            }
            var pointsSorted = [];
            for (i = 0; i <= loc; i++) {
                pointsSorted[ i ] = points[ pointsByAngle[ i ].index ];
            }
            return pointsSorted;
        },

        _pointsCW: function (p1, p2, p3) {
            return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
        }

    });

    // Using Box2D.SCALE == 0.1, the maximum speed any body may
    // move will be approximately (max * 300) pixels per second.
    var max = 10; // default 2
    Box2D.Common.b2Settings.b2_maxTranslation = max;
    Box2D.Common.b2Settings.b2_maxTranslationSquared = max * max;
    /// A velocity threshold for elastic collisions. Any collision with a relative linear
    /// velocity below this threshold will be treated as inelastic.
    Box2D.Common.b2Settings.b2_velocityThreshold=1;

});
