ig.module('game.polygon-collider')
    .requires()
    .defines(function() {

        PolygonCollider = ig.Class.extend({

        	polygonData1: null,
        	polygonData2: null,
        	arrayPolygon: null,

        	init: function(polygon1, polygon2) {
        		this.ctx = ig.system.context;
		        this.polygon1 = polygon1;
		        this.polygon2 = polygon2;
		    },

		    getDistanceBy: function(a, b) {
	            /**
	            * Get distance between 2 points
	            * @param  {Point} a - Point Vector 1
	            * @param  {Point} b - Point Vector 2
	            * @return {number} returns a distance number
	            */
	            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
	        },

		    collide: function() {

		    	this.polygonData1 = this.getCentroidAndFarthestVertex(this.polygon1);
		    	this.polygonData2 = this.getCentroidAndFarthestVertex(this.polygon2);

		    	if(this.polygonData1 && this.polygonData2){
		    		if(this.getDistanceBy(this.polygonData1.centroid, this.polygonData2.centroid) > this.polygonData1.length + this.polygonData2.length){
			    		//console.log("distance are not close")
			    		return;
			    	}
		    	}
		    	else{ return; }

		    	if(this.isConvexPolygon(this.polygon1) == false){
		    		this.arrayPolygon = new PolygonTriangulation(this.polygon1).getConvexPolygons();
		    		return this.checkAllCollision(this.polygon2, this.arrayPolygon);
		    	}
		    	else if(this.isConvexPolygon(this.polygon2) == false){
		    		this.arrayPolygon = new PolygonTriangulation(this.polygon2).getConvexPolygons();
		    		return this.checkAllCollision(this.polygon1, this.arrayPolygon);
		    	}
		    	else if( this.isConvexPolygon(this.polygon1) == false &&
		    			 this.isConvexPolygon(this.polygon2) == false ){
		    		//checking collision of two concave polygon is possible but it is too complex 
		    		//and makes a toll on performance
		    		return false;
		    	}
		    	else{
		    		return this.checkCollision(this.polygon1, this.polygon2) && 
		        	   	   this.checkCollision(this.polygon2, this.polygon1);
		    	}
		    },

		    drawDebug: function(){
		    	if(this.polygonData1) this.drawCentroidAndFarthestVertex(this.polygonData1);
		    	if(this.polygonData2) this.drawCentroidAndFarthestVertex(this.polygonData2);
		    	
		    	if(this.arrayPolygon){
		    		this.arrayPolygon.forEach(function(el){ this.drawArrayPolygon(el); }.bind(this))
		    	}
		    },

		    drawCentroidAndFarthestVertex: function(data){
		    	this.ctx.save();
		    	this.ctx.fillStyle = "cyan";
		    	this.ctx.fillRect(data.centroid.x - 5, data.centroid.y - 5, 10, 10);
		    	this.ctx.restore();

		    	this.ctx.save();
		    	this.ctx.fillStyle = "red";
		    	this.ctx.fillRect(data.apex.x - 15, data.apex.y - 15, 30, 30);
		    	this.ctx.restore();
		    },

		    drawArrayPolygon: function(arrPolygon){
		    	if(arrPolygon.length != 0){

	                this.ctx.save();
	                this.ctx.globalAlpha = 1;
	                this.ctx.lineWidth = 10;
	                this.ctx.strokeStyle = "blue";

	                if(arrPolygon.length >= 2){
	                    this.ctx.lineJoin = "round";
	                    this.ctx.beginPath();
	                    this.ctx.moveTo(arrPolygon[0].x, arrPolygon[0].y); 
	                }

	                for (var i = 0; i < arrPolygon.length; i++) {
	                    if(arrPolygon.length >= 2 && i >= 1){
	                        if(arrPolygon[i]) this.ctx.lineTo(arrPolygon[i].x, arrPolygon[i].y);
	                        else continue;
	                    }
	                }

	                if(arrPolygon.length >= 2){
	                    this.ctx.closePath(); 
	                    this.ctx.stroke();
	                }

	                this.ctx.restore();
	            }
		    },

		    checkAllCollision: function(polygon, arrPolygon){
		    	var isCollide = false;
		    	for (var i = 0; i < arrPolygon.length; i++) {
		    		if(this.checkCollision(polygon, arrPolygon[i]) == true){
		    			isCollide = true;
		    			break;
		    		}
		    	}

		    	return isCollide;
		    },

		    isConvexPolygon: function(vertices) {
                var n = vertices.length;
                if (n < 3) return false; // A polygon must have at least 3 vertices

                var prevCrossProduct = 0;

                for (var i = 0; i < n; i++) {
                    var p0 = vertices[i];
                    var p1 = vertices[(i + 1) % n];
                    var p2 = vertices[(i + 2) % n];

                    var dx1 = p1.x - p0.x;
                    var dy1 = p1.y - p0.y;
                    var dx2 = p2.x - p1.x;
                    var dy2 = p2.y - p1.y;

                    var crossProduct = dx1 * dy2 - dy1 * dx2;

                    if (crossProduct !== 0) {
                        if (prevCrossProduct === 0) {
                            prevCrossProduct = crossProduct;
                        } else if (crossProduct * prevCrossProduct < 0) {
                            return false;
                        }
                    }
                }

                return true;
            },

		    checkCollision: function(polygon1, polygon2) {
		        var axes = this.getAxes(polygon1).concat(this.getAxes(polygon2));
		        for (var i = 0; i < axes.length; i++) {
		            var projection1 = this.projectPolygon(axes[i], polygon1);
		            var projection2 = this.projectPolygon(axes[i], polygon2);
		            if (!this.overlap(projection1, projection2)) {
		                return false;
		            }
		        }
		        return true;
		    },

			getAllContactEdges: function() {
				var contactEdges = [];
				for (var i = 0; i < this.polygon2.length; i++) {
					var v1 = this.polygon2[i];
					var v2 = this.polygon2[(i + 1) % this.polygon2.length];
					for (var j = 0; j < this.polygon1.length; j++) {
						var u1 = this.polygon1[j];
						var u2 = this.polygon1[(j + 1) % this.polygon1.length];
						if (this.segmentsIntersect(v1, v2, u1, u2)) {
							contactEdges.push([v1, v2]);
							break;
						}
					}
				}
				return contactEdges;
			},

		    segmentsIntersect: function(p1, p2, q1, q2) {
		        return (this.ccw(p1, q1, q2) != this.ccw(p2, q1, q2)) && (this.ccw(p1, p2, q1) != this.ccw(p1, p2, q2));
		    },

			ccw: function(a, b, c) {
		        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
		    },

		    getAxes: function(polygon) {
		        var axes = [];
		        for (var i = 0; i < polygon.length; i++) {
		            var vertex1 = polygon[i];
		            var vertex2 = polygon[(i + 1) % polygon.length];
		            var edge = this.subtract(vertex2, vertex1);
		            var axis = this.perpendicular(edge);
		            axes.push(this.normalize(axis));
		        }
		        return axes;
		    },

		    subtract: function(vector1, vector2) {
		        return { x: vector1.x - vector2.x, y: vector1.y - vector2.y };
		    },

		    perpendicular: function(vector) {
		        return { x: -vector.y, y: vector.x };
		    },

		    dotProduct: function(vector1, vector2) {
		        return vector1.x * vector2.x + vector1.y * vector2.y;
		    },

		    projectPolygon: function(axis, polygon) {
		        var min = this.dotProduct(axis, polygon[0]);
		        var max = min;
		        for (var i = 1; i < polygon.length; i++) {
		            var projection = this.dotProduct(axis, polygon[i]);
		            if (projection < min) {
		                min = projection;
		            } else if (projection > max) {
		                max = projection;
		            }
		        }
		        return { min: min, max: max };
		    },

		    overlap: function(projection1, projection2) {
		        return projection1.max >= projection2.min && projection2.max >= projection1.min;
		    },

		    normalize: function(vector) {
		        var length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
		        return { x: vector.x / length, y: vector.y / length };
		    },

		    // Helper function to calculate the centroid of the polygon
			calculateCentroid: function(polygon) {
			    var xSum = 0
			    var ySum = 0
			    var areaSum = 0;
			    var n = polygon.length;

			    for (var i = 0; i < n; i++) {
					var x0 = polygon[i].x, y0 = polygon[i].y;
					var x1 = polygon[(i + 1) % n].x, y1 = polygon[(i + 1) % n].y;
					var area = (x0 * y1) - (x1 * y0);
					xSum += (x0 + x1) * area;
					ySum += (y0 + y1) * area;
					areaSum += area;
			    }

				var finalArea = areaSum / 2;
				var cx = xSum / (6 * finalArea);
				var cy = ySum / (6 * finalArea);

				return { x: cx, y: cy };
			},

		    getCentroidAndFarthestVertex: function(polygon) {
			    if (!Array.isArray(polygon) || polygon.length < 3) {
			    	console.log("Invalid polygon. A polygon must have at least three vertices.")
			        //throw new Error("Invalid polygon. A polygon must have at least three vertices.");
			        return false;
			    }
			
			    // Calculate the centroid
			    var centroid = this.calculateCentroid(polygon);

			    // Find the farthest vertex from the centroid
			    var farthestVertex = null;
			    var maxDistance = -Infinity;

			    for (var i = 0; i < polygon.length; i++) {
			        var distance = Math.sqrt(Math.pow(polygon[i].x - centroid.x, 2) + Math.pow(polygon[i].y - centroid.y, 2));
			        if (distance > maxDistance) {
			            maxDistance = distance;
			            farthestVertex = polygon[i];
			        }
			    }

			    return {
			        centroid: centroid,
			        apex: farthestVertex,
			        length: maxDistance
			    };
			}

        });

        // https://en.wikipedia.org/wiki/Polygon_triangulation
        PolygonTriangulation = ig.Class.extend({

            init: function(vertices) {
                this.vertices = vertices; // vertices is an array of points [ {x: x1, y: y1}, {x: x2, y: y2}, ... ]
            },

            // Function to check if a point is inside a triangle
            isPointInTriangle: function(pt, v1, v2, v3) {
                var area = (v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x);
                var s = (v1.y - v3.y) * (pt.x - v3.x) + (v3.x - v1.x) * (pt.y - v3.y);
                var t = (v2.y - v1.y) * (pt.x - v3.x) + (v1.x - v2.x) * (pt.y - v3.y);

                if (area < 0) {
                    return s <= 0 && t <= 0 && (s + t) >= area;
                } else {
                    return s >= 0 && t >= 0 && (s + t) <= area;
                }
            },

            // Function to check if a vertex is an ear
            // https://en.wikipedia.org/wiki/Two_ears_theorem
            isEar: function(polygon, i) {
                var prev = (i - 1 + polygon.length) % polygon.length;
                var next = (i + 1) % polygon.length;
                var v1 = polygon[prev];
                var v2 = polygon[i];
                var v3 = polygon[next];

                // Check if the angle is convex
                var cross = (v2.x - v1.x) * (v3.y - v2.y) - (v2.y - v1.y) * (v3.x - v2.x);
                if (cross <= 0) return false;

                // Check if any other point is inside the ear
                for (var j = 0; j < polygon.length; j++) {
                    if (j === prev || j === i || j === next) continue;
                    if (this.isPointInTriangle(polygon[j], v1, v2, v3)) return false;
                }

                return true;
            },

            // Function to perform the Ear Clipping algorithm
            triangulate: function() {
                var triangles = [];
                var polygon = this.vertices.slice(); // Make a copy of the vertices array
                var earVertices = [];

                // Precompute initial ear candidates
                for (var i = 0; i < polygon.length; i++) {
                    if (this.isEar(polygon, i)) {
                        earVertices.push(i);
                    }
                }

                while (polygon.length > 3) {
                    if (earVertices.length === 0) {
                    	triangles = [];
                        console.log("No ear found. The polygon might be malformed or not simple.");
                        return triangles;
                        //throw new Error("No ear found. The polygon might be malformed or not simple.");
                    }

                    // Pick the first ear vertex
                    var earIndex = earVertices.pop();
                    var prevIndex = (earIndex - 1 + polygon.length) % polygon.length;
                    var nextIndex = (earIndex + 1) % polygon.length;

                    // Form the triangle
                    triangles.push([polygon[prevIndex], polygon[earIndex], polygon[nextIndex]]);
                    polygon.splice(earIndex, 1);

                    // Update ear candidates around the removed vertex
                    var indicesToUpdate = [
                        (earIndex - 1 + polygon.length) % polygon.length,
                        earIndex % polygon.length,
                        (earIndex + 1) % polygon.length
                    ];

                    for (var i = 0; i < indicesToUpdate.length; i++) {
                        var earIndexPos = earVertices.indexOf(indicesToUpdate[i]);
                        if (earIndexPos !== -1) {
                            earVertices.splice(earIndexPos, 1);
                        }
                        if (this.isEar(polygon, indicesToUpdate[i])) {
                            earVertices.push(indicesToUpdate[i]);
                        }
                    }
                }

                // Add the last remaining triangle
                triangles.push([polygon[0], polygon[1], polygon[2]]);

                return triangles;
            },

            // Function to convert the triangulated polygons into convex polygons
            getConvexPolygons: function() {
                return this.triangulate();
            }

        })

    })