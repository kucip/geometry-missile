// Jason Low's SAT (Separating Axis Theorem) Class
// for 2D Polygon-Polygon, Polygon-Circle, Circle-Circle collision detection
// jason.low@impact360design.com
// ver 1.1.1

// version notes:
// 1.1.1 - fixed on Polygon to Circle Collision bug, and change module path from 'plugins.sat' to 'plugins.math.sat'
// 1.1 - added comments to clarify sat process

// ref1: http://www.dyn4j.org/2010/01/sat/
// ref2: http://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
// note1: currently uses brute force method for getting closest point for Polygon-Circle detection

// Usage Examples:
/*
this.sat = new ig.SAT();

// Polygon-Polygon
var s1 = new ig.SAT.Shape([rayStart, rayEnd]);
var s2 = new ig.SAT.Shape(this.detectionShapePointList);
result = this.sat.simpleShapeIntersect(s1, s2);

// Polygon-Circle
var s1 = new ig.SAT.Shape([rayStart, rayEnd]);
var s2 = new ig.SAT.Circle(circle.pos, circle.radius);
result = this.sat.simpleShapeIntersect(s1, s2);

// Circle-Circle
var s1 = new ig.SAT.Circle(circle1.pos, circle1.radius);
var s2 = new ig.SAT.Circle(circle2.pos, circle2.radius);
result = this.sat.simpleShapeIntersect(s1, s2);
*/

ig.module( 'plugins.math.sat' )
.requires(

)
.defines(function(){

ig.SAT = ig.Class.extend({

    init: function(){

    },

    // Main SAT implementation (with MTV)
    // MTV (Minimum Translation Vector) is used for pushing back entities out of collision
    mtvForShapeIntersect: function(shape1, shape2){
        var overlap = 10000; // really large value

        var smallestAxis = null;

        var axes1 = [];
        var axes2 = [];

        // First Step: Get Axes
        if (shape1.isCircle() && shape2.isCircle()) {
            // for two circles there is only one axis test
            axes1.push(shape1.center.subtract(shape2.center).normalized());

        }else if(shape2.isCircle() || shape1.isCircle()){
            // circle and polygon
            if(shape1.isCircle()){
                // Swap shape1 and shape2
                var tempShape = shape2;
                shape2 = shape1;
                shape1 = tempShape;
            }
            // shape1 is a polygon, shape2 is a circle
            var closestPoint = shape1.pointList[0];
            var minDistance = shape2.center.manhattanDistance(closestPoint);
            axes1 = shape1.getNormalizedAxes();
            for(var i=1; i<shape1.pointList.length; i++){
                var p = shape1.pointList[i];
                var d = shape2.center.manhattanDistance(p);
                if(d<minDistance) {
                    minDistance = d;
                    closestPoint = p;
                }
            }
            axes2.push(shape2.center.subtract(closestPoint).normalized());

        }else{
            // polygon and polygon
            axes1 = shape1.getNormalizedAxes();
            axes2 = shape2.getNormalizedAxes();
        }

        // Last Step: For each axis, check against each shape's projection
        // loop over the axes1
        for (var i = 0; i < axes1.length; i++) {
            var axis = axes1[i];
            // project both shapes onto the axis
            var p1 = shape1.project(axis);
            var p2 = shape2.project(axis);
            // do the projections overlap?
            if (!p1.overlap(p2)) {
                // then we can guarantee that the shapes do not overlap
                return null;
            } else {
                // get the overlap
                var o = p1.getOverlap(p2);
                // check for containment
                if (p1.contains(p2) || p2.contains(p1)) {
                    // get the overlap plus the distance from the minimum end points
                    var mins = Math.abs(p1.min - p2.min);
                    var maxs = Math.abs(p1.max - p2.max);
                    // NOTE: depending on which is smaller you may need to
                    // negate the separating axis!!
                    if (mins < maxs) {
                        o += mins;
                    } else {
                        o += maxs;
                    }
                }
                // check for minimum
                if (o < overlap) {
                    // then set this one as the smallest
                    overlap = o;
                    smallestAxis = axis;
                }
            }
        }
        // loop over the axes2
        for (var i = 0; i < axes2.length; i++) {
            var axis = axes2[i];
            // project both shapes onto the axis
            var p1 = shape1.project(axis);
            var p2 = shape2.project(axis);
            // do the projections overlap?
            if (!p1.overlap(p2)) {
                // then we can guarantee that the shapes do not overlap
                return null;
            } else {
                // get the overlap
                var o = p1.getOverlap(p2);
                // check for containment
                if (p1.contains(p2) || p2.contains(p1)) {
                    // get the overlap plus the distance from the minimum end points
                    var mins = Math.abs(p1.min - p2.min);
                    var maxs = Math.abs(p1.max - p2.max);
                    // NOTE: depending on which is smaller you may need to
                    // negate the separating axis!!
                    if (mins < maxs) {
                        o += mins;
                    } else {
                        o += maxs;
                    }
                }
                // check for minimum
                if (o < overlap) {
                    // then set this one as the smallest
                    overlap = o;
                    smallestAxis = axis;
                }
            }
        }

        // if we get here then we know that every axis had overlap on it
        // so we can guarantee an intersection
        var mtv = new ig.SAT.MTV(smallestAxis, overlap);
        return mtv;
    },

    // SAT implementation without MTV
    simpleShapeIntersect: function(shape1, shape2){
        var axes1 = [];
        var axes2 = [];

        // First Step: Get Axes
        if (shape1.isCircle() && shape2.isCircle()) {
            // for two circles there is only one axis test
            axes1.push(shape1.center.subtract(shape2.center).normalized());

        }else if(shape2.isCircle() || shape1.isCircle()){
            // circle and polygon
            if(shape1.isCircle()){
                // Swap shape1 and shape2
                var tempShape = shape2;
                shape2 = shape1;
                shape1 = tempShape;
            }
            // shape1 is a polygon, shape2 is a circle
            var closestPoint = shape1.pointList[0];
            var minDistance = shape2.center.manhattanDistance(closestPoint);
            axes1 = shape1.getNormalizedAxes();
            for(var i=1; i<shape1.pointList.length; i++){
                var p = shape1.pointList[i];
                var d = shape2.center.manhattanDistance(p);
                if(d<minDistance) {
                    minDistance = d;
                    closestPoint = p;
                }
            }
            axes2.push(shape2.center.subtract(closestPoint).normalized());

        }else{
            // polygon and polygon
            axes1 = shape1.getNormalizedAxes();
            axes2 = shape2.getNormalizedAxes();
        }

        // Last Step: For each axis, check against each shape's projection
        // loop over the axes1
        for (var i = 0; i < axes1.length; i++) {
            var axis = axes1[i];
            // project both shapes onto the axis
            var p1 = shape1.project(axis);
            var p2 = shape2.project(axis);
            // do the projections overlap?
            if (!p1.overlap(p2)) {
                // then we can guarantee that the shapes do not overlap
                return false;
            }
        }
        // loop over the axes2
        for (var i = 0; i < axes2.length; i++) {
            var axis = axes2[i];
            // project both shapes onto the axis
            var p1 = shape1.project(axis);
            var p2 = shape2.project(axis);
            // do the projections overlap?
            if (!p2.overlap(p1)) {
                // then we can guarantee that the shapes do not overlap
                return false;
            }
        }

        // if we get here then we know that every axis had overlap on it
        // so we can guarantee an intersection
        return true;
    },
});

ig.SAT.Vector2D = ig.Class.extend({
    x:0,
    y:0,

    init:function(x, y){
        this.x = x;
        this.y = y;
    },

    subtract: function(b){
        return new ig.SAT.Vector2D(this.x-b.x, this.y-b.y);
    },

    getNormal: function(){
        var normal = new ig.SAT.Vector2D(-this.y, this.x);
        return normal;
    },

    getNormalizedNormal: function(){
        var normal = new ig.SAT.Vector2D(-this.y, this.x);
        return normal.normalized();
    },

    normalized: function(){
        var l = Math.sqrt(this.x*this.x + this.y*this.y);
        if(l==0) return new ig.SAT.Vector2D(0,0);
        return new ig.SAT.Vector2D(this.x/l, this.y/l);
    },

    distance: function(b){
        var dx = b.x-this.x;
        var dy = b.y-this.y;
        return Math.sqrt(dx*dx + dy*dy);
    },

    manhattanDistance: function(b){
        var dx = b.x-this.x;
        var dy = b.y-this.y;
        return dx*dx + dy*dy;
    },

    dotProduct: function(b){
        return this.x*b.x + this.y*b.y;
    },

    crossProduct: function(b){
        return this.x*b.y - this.y*b.x;
    },

    getAngle: function(b){
        return Math.atan2(this.crossProduct(b), this.dotProduct(b));
    },
});

ig.SAT.Shape = ig.Class.extend({
    pointList: [],
    center: null,

    init:function(pointList){
        this.pointList = [];

        for(var i=0; i<pointList.length; i++){
            var p = pointList[i];
            this.pointList.push(new ig.SAT.Vector2D(p.x, p.y));
        }
    },

    isCircle: function(){
        return false;
    },

    getAxes: function(){
        var axes = [];
        if(this.pointList.length <= 1){
            return axes;
        }

        // only need 1 axis for line segments (aka shapes with 2 points)
        if(this.pointList.length == 2){
            var p1 = this.pointList[0];
            var p2 = this.pointList[1];
            var edge = p1.subtract(p2);
            var normal = edge.getNormal();
            if(normal.x != 0 || normal.y != 0) {
                axes.push(normal);
            }
            return axes;
        }

        // further optimisation can be done for shapes with parallel edges
        // like rectangles (halves the number of axes)

        for(var i=0; i<this.pointList.length; i++){
            var p1 = this.pointList[i];
            var p2 = this.pointList[i+1 == this.pointList.length ? 0 : i+1];
            var edge = p1.subtract(p2);
            var normal = edge.getNormal();
            if(normal.x != 0 || normal.y != 0) {
                axes.push(normal);
            }
        }
        return axes;
    },

    getNormalizedAxes: function(){
        var axes = [];

        for(var i=0; i<this.pointList.length; i++){
            var p1 = this.pointList[i];
            var p2 = this.pointList[i+1 == this.pointList.length ? 0 : i+1];
            var edge = p1.subtract(p2);
            var normal = edge.getNormalizedNormal();
            if(normal.x != 0 || normal.y != 0) {
                axes.push(normal);
            }
        }
        return axes;
    },

    project: function(axis){
        return new ig.SAT.Projection(this.pointList, axis);
    },
});

ig.SAT.Circle = ig.SAT.Shape.extend({
    center: null,
    radius: 0,

    init:function(center, radius){
        this.center = new ig.SAT.Vector2D(center.x, center.y);
        this.radius = radius;
    },

    isCircle: function(){
        return true;
    },

    getAxes: function(){
        return [];
    },

    getNormalizedAxes: function(){
        return [];
    },

    project: function(axis){
        var p = new ig.SAT.Projection([], axis);

        var centerProjection = this.center.dotProduct(axis);
        p.min = centerProjection - this.radius;
        p.max = centerProjection + this.radius;

        return p;
    },
});

// reminder: a 2D shape is projected as a 1D scalar along a line
// a projection of a shape is represented by 2 float numbers (min, max)
// indicating its location on the given projected axis
ig.SAT.Projection = ig.Class.extend({
    min: null,
    max: null,

    init:function(pointList, axis){
        if(!pointList || pointList.length <= 0) return this;

        this.min = pointList[0].dotProduct(axis);
        this.max = pointList[0].dotProduct(axis);

        for (var j = 1; j < pointList.length; j++)
        {
            var cur = pointList[j].dotProduct(axis);

            //select the maximum projection on axis to corresponding box corners
            if (this.min > cur) {
                this.min = cur;
            }
            //select the minimum projection on axis to corresponding box corners
            if (cur> this.max) {
                this.max = cur;
            }
        }
    },

    overlap: function(otherProjection){
        var p1 = this;
        var p2 = otherProjection;

        var isSeparated = p1.max < p2.min || p2.max < p1.min;
        return !isSeparated;
    },

    getOverlap: function(otherProjection){
        var p1 = this;
        var p2 = otherProjection;

        var d = p1.max-p2.min;
        var d2 = p2.max-p1.min;

        if(d2 < d) d = d2;

        return d;
    },

    contains: function(otherProjection){
        var p1 = this;
        var p2 = otherProjection;

        var l1 = p1.max-p1.min;
        var l2 = p2.max-p2.min;

        if(l2 < l1){
            var d = p1.max-p2.min;
            if(d<=0) d = p2.max-p1.min;

            if(d >= l1){
                return true;
            }
        }

        return false;
    },
});

// MTV (Minimum Translation Vector)
ig.SAT.MTV = ig.Class.extend({
    axis: null,
    overlapAmount: 0,

    init:function(axis, overlap){
        this.axis = axis;
        this.overlapAmount = overlap;
    },
});

});