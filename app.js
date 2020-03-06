/* =========================================================================== *
 *                                     PUNCTUM                                 *
 * =========================================================================== */

function Point(x, y, colour) {
	this.x = x;
	this.y = y;
	this.colour = colour;
	this.type = 1;
}

Point.prototype.subtract = function (p) {
	return new Point(this.x - p.x, this.y - p.y);
}

Point.prototype.vectorTo = function (p) {
	return p.subtract(this);
}

Point.prototype.vectorDotProd = function (q) {
	return this.x * q.x + this.y * q.y;
}

Point.prototype.vectorCrossProd = function (q) {
	return this.x * q.y - this.y * q.x;
}

Point.prototype.scale = function (c) {
	return new Point(this.x * c, this.y * c);
}

Point.prototype.add = function (p) {
	return new Point(this.x + p.x, this.y + p.y);
}

Point.prototype.length = function () {
	var x = this.x;
	var y = this.y;
	return Math.sqrt(x * x + y * y);
}

Point.prototype.normalize = function () {
	if (this.length() == 0) {
		return new Point(0, 0);
	}
	return this.scale(1 / this.length());
}

Point.prototype.dist = function (p) {
	return this.subtract(p).length();
}

Point.defineMiddle = function (a, b) {
	var p = new Point();
	p.x = (a.x + b.x) / 2;
	p.y = (a.y + b.y) / 2;
	return p;
}

Point.prototype.draw = function (ctx, high) {
	ctx.beginPath();
	ctx.arc(this.x, this.y, high ? 4 : 2, 0, 2 * Math.PI, false);
	ctx.fillStyle = 'dark brown';
	ctx.fill();
	ctx.lineWidth = 2;
	ctx.strokeStyle = this.colour || BROWN;
	ctx.stroke();
}

Point.prototype.intersect = function (obj) {
	return [];
}

Point.prototype.getClosest = function (p) {
	return new Point(this.x, this.y);
}


/* =========================================================================== *
 *                                     LINEA                                   *
 * =========================================================================== */

function Line(colour) {
	this.slope = 1;
	this.y_intercept = 0;
	this.colour = colour;
	this.type = 2;
}

Line.defineTwoPoints = function (a, b, colour) {
	var l = new Line(colour);
	if (a.x == b.x) {
		l.x = a.x;
	} else {
		l.slope = (a.y - b.y) / (a.x - b.x);
		l.y_intercept = a.y - l.slope * a.x;
	}
	l.a = a;
	l.b = b;
	return l;
}

Line.defineSegment = function (a, b, colour) {
	var l = Line.defineTwoPoints(a, b, colour);
	l.segment = true;
	l.len = function () {
		return this.a.dist(this.b).toFixed(7);
	}
	return l;
}

Line.defineRay = function (a, b, colour) {
	var l = Line.defineTwoPoints(a, b, colour);
	l.ray = true;
	return l;
}

Line.defineLineVertical = function (line, p, colour) {
	var vertical = new Line(colour);
	if (line.x != undefined) {
		vertical.slope = 0;
		vertical.y_intercept = p.y;
	}
	else if (line.slope == 0)
		vertical.x = p.x;
	else {
		vertical.slope = -1 / line.slope;
		vertical.y_intercept = p.y - vertical.slope * p.x;
	}
	// just for the redrawing to work (selectClosest)
	vertical.a = p;
	vertical.b = p.scale(777);
	return vertical;
}

Line.defineLineParalel = function (m, p, colour) {
	var l = Line.defineLineVertical(m, p);
	return Line.defineLineVertical(l, p, colour);
}

Line.defineSegmentBisector = function (p, q, colour) {
	var point = Point.defineMiddle(p, q);
	var l = Line.defineTwoPoints(p, q);
	return Line.defineLineVertical(l, point, colour);
}

Line.defineAngleBisector = function (p, q, r, colour) {
	var a = q.vectorTo(p).normalize();
	var b = q.vectorTo(r).normalize();
	var c = Point.defineMiddle(q.add(a), q.add(b));
	if (q.dist(c) == 0) {
		return Line.defineLineVertical(Line.defineTwoPoints(p, r), q);
	}
	return Line.defineTwoPoints(q, c, colour);
}

Line.prototype.draw = function (ctx, high) {
	ctx.beginPath();
	if (this.segment) {
		ctx.moveTo(this.a.x, this.a.y);
		ctx.lineTo(this.b.x, this.b.y);
	} else if (this.ray) {
		ctx.moveTo(this.a.x, this.a.y);
		if (this.x != undefined) {
			this.a.y < this.b.y ?
				ctx.lineTo(this.a.x, 2000) :
				ctx.lineTo(this.a.x, -2000); // for drag and drop
		} else {
			this.a.x < this.b.x ?
				ctx.lineTo(2000, 2000 * this.slope + this.y_intercept) :
				// fix for drag and drop
				ctx.lineTo(0, this.y_intercept);
		}
	} else if (this.x != undefined) {
		ctx.moveTo(this.x, 0);
		ctx.lineTo(this.x, 2000);
	} else {
		ctx.moveTo(0, this.y_intercept);
		ctx.lineTo(2000, 2000 * this.slope + this.y_intercept);
	}
	ctx.lineWidth = high ? 3 : 2;
	ctx.strokeStyle = this.colour || GRAY;
	ctx.stroke();
}

Line.prototype.intersect = function (obj) {
	if (this.type > obj.type)
		return obj.intersect(this);
	else if (obj.type == 2) {
		if (this.segment || this.ray || obj.segment || obj.ray) {
			return lineIntersections.segsAndRays(this, obj);
		}
		return lineIntersections.lineWithLine(this, obj);
	}
	else if (obj.type == 4) {
		if (this.segment || this.ray || obj.segment || obj.ray) {
			return lineIntersections.segRayCircle(this, obj)
		}
		return lineIntersections.lineWithCircle(this, obj);
	}
	return [];
}

Line.prototype.dist = function (p) {
	var q = this.getClosest(p);
	return p.dist(q);
}

Line.prototype.getClosest = function (p) {
	var l = Line.defineLineVertical(this, p);
	let t = this.intersect(l)[0];
	if (!t) {
		return this.a.dist(p) < this.b.dist(p) ?
			this.a : this.b
	}
	return t;
}

Line.prototype.contains = function (p) {
	// check t for the parametric equation:
	// p.{x,y} = a.{x,y} * (1 - t) + b.{x,y} * t 
	t1 = (p.x - this.a.x) / (this.b.x - this.a.x);
	t2 = (p.y - this.a.y) / (this.b.y - this.a.y);
	if (this.segment) {
		return between(t1, 0, 1) && between(t2, 0, 1);
	} else if (this.ray) {
		return t1 > 0 && t2 > 0;
	} else if (this.x != undefined) {
		return p.x == this.x;
	}
	return p.x * this.slope + this.y_intercept == p.y;
}


/* =========================================================================== *
 *                                     CIRCULUS                                *
 * =========================================================================== */

function Circle(o, r, colour) {
	this.o = o;
	this.r = r;
	this.colour = colour;
	this.type = 4;
}

Circle.defineTwoPoint = function (o, p, colour) {
	var c = new Circle(colour);
	c.o = o;
	c.r = o.dist(p);
	return c;
}

Circle.defineThreePoint = function (a, b, c, colour) {
	var l = Line.defineSegmentBisector(a, b);
	var m = Line.defineSegmentBisector(b, c);
	var p = l.intersect(m);
	return Circle.defineTwoPoint(p[0], a, colour);
}

Circle.prototype.draw = function (ctx, high) {
	ctx.beginPath();
	ctx.arc(this.o.x, this.o.y, this.r, 0, 2 * Math.PI, false);
	ctx.lineWidth = high ? 3 : 2;
	ctx.strokeStyle = this.colour || GRAY;
	ctx.stroke();
}

Circle.prototype.dist = function (p) {
	return Math.abs(this.o.dist(p) - this.r);
}

Circle.prototype.intersect = function (obj) {
	if (this.type > obj.type)
		return obj.intersect(this);
	else if (obj.type == 4) {
		var w = ( square(this.r)
			- square(obj.r)
		    	- square(this.o.x)
			+ square(obj.o.x)
			- square(this.o.y)
		        + square(obj.o.y) ) / 2;
		var l = Line.defineTwoPoints(this.o, obj.o);
		var p = new Point();
		p.x =    (w - l.y_intercept * (obj.o.y - this.o.y)) /
		    (obj.o.x - this.o.x + l.slope * (obj.o.y - this.o.y));
		p.y = l.slope * p.x + l.y_intercept;
		var m = Line.defineLineVertical(l, p);
		return this.intersect(m);
	}
	else
		return [];
}

Circle.prototype.getClosest = function (p) {
	var l = Line.defineTwoPoints(p, this.o);
	var points = l.intersect(this);
	if (points[0].dist(p) < points[1].dist(p))
		return points[0];
	return points[1];
}


/* =========================================================================== *
 *                                   ANGULUS                                   *
 * =========================================================================== */

function Angle(c, p1, p2, color) {
	this.c = c;
	this.p1 = p1;
	this.p2 = p2;
	this.color = color || GRAY;
	let d1 = c.vectorTo(p1);
	let d2 = c.vectorTo(p2);
	this.a1 = Math.atan2(d1.y, d1.x);
	this.a2 = Math.atan2(d2.y, d2.x);
	this.indy = true;
}

Angle.prototype.draw = function (ctx) {
	// calculate angle's shadow radius
	let line = Line.defineTwoPoints(this.p1, this.p2);
	let vertical = Line.defineLineVertical(line, this.c);
	let sect = line.intersect(vertical)[0];
	let vertDist = this.c.dist(sect);
	let angRad = vertDist * 0.4;

	// choose the angle < 180 (for triangles)
	let start, end, anticlock;
	if (this.a1 < this.a2) {
		start = this.a1;
		end = this.a2;
		if (Math.abs(this.a1-this.a2) > Math.PI)
			anticlock=true;
	} else {
		start = this.a2;
		end = this.a1;
		if (Math.abs(this.a1-this.a2) > Math.PI)
			anticlock=true;
	}
	ctx.beginPath();
  	ctx.moveTo(this.c.x, this.c.y);
	ctx.arc(this.c.x, this.c.y, angRad, start, end, anticlock);
	ctx.closePath();
	ctx.fillStyle = this.color || GRAY;
	ctx.globalAlpha = 0.6;
	ctx.fill();
}


/* =========================================================================== *
 *                                   LITTERA                                   *
 * =========================================================================== */

function Text(txt) {
	this.text = txt;
	this.indy = true;
}

Text.prototype.draw = function td(ctx, color) {
	ctx.font = 'bold 13px Arial';
	ctx.fillStyle = color || '#640303';
	x = 10; y = 18;
	ctx.fillText(this.text, x, y);
}


/* =========================================================================== *
 *                              TOOLBAR-CONTROLLER                             *
 * =========================================================================== */

ToolbarController = function (canvasObj) {
	var tc = this;
	this.canvasObj = canvasObj;
	document.querySelectorAll("[data-action]").forEach(function (button) {
		button.onclick = () => tc.actionClick(button);
	});
	document.querySelectorAll("[data-actionremove]").forEach(function (button) {
		button.onclick = () => tc.removeClick(button);
	});
}

ToolbarController.prototype.actionClick = function (element) {
	this.deselectButtons();
	element.className += ' button-selected';
	this.canvasObj[element.dataset['action']]();
}

ToolbarController.prototype.removeClick = function (element) {
	this.deselectButtons();
	element.className += ' button-selected';
	this.canvasObj.remove();
}

ToolbarController.prototype.deselectButtons = function () {
	var elems = document.getElementsByClassName("button");
	for (var i = 0; i < elems.length; i++) {
		elems[i].classList.remove("button-selected");
	}
}


/* =========================================================================== *
 *                               OBJECT-SELECTION                              *
 * =========================================================================== */

var MAX_SNAP_DIST = 10;

function filterNearby(arr, p) {
	return arr.filter(x => x.dist(p) <= MAX_SNAP_DIST);
}

function filterType(arr, allowedTypes) {
	return arr.filter(x => x.type & allowedTypes);
}

function argmin(arr, map) {
	return arr.map(map).reduce(
		(min, cur) => cur[0] < min[0] ? cur : min, [1000, undefined]
	)[1];
}

function selectClosest(options, p) {
	return argmin(options, x => [x.dist(p), x]);
}

function getIntersections(arr) {
	sol = []
	for (var o1 of arr)
		for (var o2 of arr)
			sol = sol.concat(o1.intersect(o2));
	return sol;
}

function snapToExistingPoints(pointer, objects, allowedTypes) {
	if (1 & allowedTypes == 0)
		return undefined;
	var points = filterType(objects, 1);
	return selectClosest(points, pointer);
}

function snapToIntersections(pointer, objects, allowedTypes) {
	if (1 & allowedTypes == 0)
		return undefined;
	var larges = filterType(objects, 6);
	var nearbyIntersections = filterNearby(getIntersections(larges), pointer);
	return selectClosest(nearbyIntersections, pointer);
}

function snapToLarges(pointer, objects, allowedTypes) {
	allowedTypes ^= 1;
	var larges = filterType(objects, allowedTypes);
	return selectClosest(larges, pointer);
}

function snapToPointsOnLarges(pointer, objects, allowedTypes) {
	if (1 & allowedTypes == 0)
		return undefined;
	var nearbyLarges = filterType(objects, 6);
	var nearbyPointsOnLarges = nearbyLarges.map(x => x.getClosest(pointer));
	return selectClosest(nearbyPointsOnLarges, pointer);
}

function selectFirst(array) {
	return array.filter(x => x != undefined)[0];
}

function selectSnapped(pointer, objects, allowedTypes) {
	var nearbyObjects = filterNearby(objects, pointer);

	var existingPoints = snapToExistingPoints(pointer, nearbyObjects, allowedTypes);
	var intersections = snapToIntersections(pointer, nearbyObjects, allowedTypes);
	var larges = snapToLarges(pointer, nearbyObjects, allowedTypes);
	var pointsOnLarges = snapToPointsOnLarges(pointer, nearbyObjects, allowedTypes);
	return selectFirst([existingPoints, intersections, larges, pointsOnLarges]);
}

var getHighlighted = selectSnapped;

function selectObject(pointer, objects, allowedTypes) {
	var snapped = selectSnapped(pointer, objects, allowedTypes);
	if ((snapped == undefined) && (1 & allowedTypes))
		return pointer;
	return snapped;
}


/* =========================================================================== *
 *                                   PLAEN                                     *
 * =========================================================================== */

function PlaenController(canvasElement) {
	this.canvasElement = canvasElement;
	this.objects = [];
	this.indyObjects = [];
	this.selectType = 0;

	this.canvasElement.addEventListener("mousedown", this, false);
	this.mouseX = 0;
	this.mouseY = 0;
	var gc = this;
	this.canvasElement.onmousemove = function (event) {
		gc.mouseX = event.offsetX;
		gc.mouseY = event.offsetY;
		// console.log(gc.mouseX, gc.mouseY);
	};
	this.ctx = this.canvasElement.getContext("2d");
}

PlaenController.prototype.remove = async function () {
	var obj = await this.asyncSelectObject(7);
	var ind = this.objects.indexOf(obj);

	if (ind != -1) {
		this.objects.splice(ind, 1);
	}
	this.remove();
}

function genericAddObjects(types, fun) {
	return async function () {
		while (true) {
			var args = [];
			for (var t of types) {
				args.push(await this.asyncSelectObject(t));
			}
			var ret = fun(...args);
			if (!Array.isArray(ret))
				ret = [ret];
			for (var obj of ret) {
				this.addObject(obj);
			}
		}
	};
}

PlaenController.prototype.point = async function () {
	await this.asyncSelectObject(1);
	this.point();
}

PlaenController.prototype.middlePoint = genericAddObjects([1, 1], Point.defineMiddle);

PlaenController.prototype.twoPointLine = genericAddObjects([1, 1], Line.defineTwoPoints);

PlaenController.prototype.verticalLine = genericAddObjects([2, 1], Line.defineLineVertical);

PlaenController.prototype.paralelLine = genericAddObjects([2, 1], Line.defineLineParalel);

PlaenController.prototype.segmentBisector = genericAddObjects([1, 1], Line.defineSegmentBisector);

PlaenController.prototype.angleBisector = genericAddObjects([1, 1, 1], Line.defineAngleBisector);

PlaenController.prototype.circleTwoPoint = genericAddObjects([1, 1], Circle.defineTwoPoint);

PlaenController.prototype.circleThreePoint = genericAddObjects([1, 1, 1], Circle.defineThreePoint);

PlaenController.prototype.circleCompass = async function () {
	var firstPoint = await this.asyncSelectObject(1);
	var secondPoint = await this.asyncSelectObject(1);
	var thirdPoint = await this.asyncSelectObject(1);
	this.addObject(new Circle(thirdPoint, firstPoint.dist(secondPoint)));
	this.circleCompass();
}

PlaenController.prototype.intersectObjects = async function () {
	var o1 = await this.asyncSelectObject(7);
	var o2 = await this.asyncSelectObject(7);
	var w = o1.intersect(o2);
	for (var i = 0; i < w.length; i++)
		this.addObject(w[i]);
	this.redraw();
	this.intersectObjects();
}

PlaenController.prototype.handleEvent = function (event) {
	if (this.selectType == 0)
		return;
	var x = event.offsetX;
	var y = event.offsetY;
	var p = new Point(x, y);
	var obj = selectObject(p, this.objects, this.selectType);
	if (obj != undefined) {
		if (!this.objects.includes(obj))
			this.addObject(obj);
	}
	if (obj == undefined)
		return;
	this.selectType = 0;
	this.returnFunc(obj);
}

PlaenController.prototype.redraw = function () {
	this.canvasElement.width = dynCanvasWidth();
	this.canvasElement.height = dynCanvasHeight();
	var highlighted = getHighlighted(
		new Point(this.mouseX, this.mouseY),
		this.objects,
		this.selectType
	);
	if (highlighted != undefined && highlighted.type > 1)
		highlighted.draw(this.ctx, 'high');
	// this.objects.sort((a, b) => a.type < b.type);
	for (var i = 0; i < this.objects.length; i++)
		this.objects[i].draw(this.ctx);
	if (highlighted != undefined && highlighted.type == 1)
		highlighted.draw(this.ctx, 'high');
	if (this.indyObjects.length > 0)
		this.indyObjects.forEach(el => el.draw(this.ctx));
}

PlaenController.prototype.asyncSelectObject = function (type) {
	var plaen = this
	return new Promise(function (resolve, reject) {
		plaen.selectType = type;
		plaen.returnFunc = resolve;
		plaen.reject = reject;
	});
}

PlaenController.prototype.addObject = function (obj) {
	if (obj.indy)
		this.indyObjects.push(obj);
	else
		this.objects.push(obj);
}

function load() {
	plaenController = new PlaenController(document.getElementById("canvas"));
	new ToolbarController(plaenController);
	setInterval(() => plaenController.redraw(), 100);
}


/* =========================================================================== *
 *                                    HELPERS                                  *
 * =========================================================================== */

// CONSTANTS 
var RED   = '#770000';
var GREEN = '#007700';
var BLUE  = '#000077';
var BLACK = '#000000';
var WHITE = '#FFFFFF';
var BROWN = '#3e2a14';
var GRAY  = '#5b5b5b';

function square(x) {
	return x * x;
}

function toDegs(rads) {
	return rads * 180 / Math.PI;
}

function between(x, a, b) {
	return x >= a && x <= b;
}

// start propositions with necessary elements already drawn
function bootstrap(ar) {
	ar.forEach(e => plaenController.addObject(e));
}

// try to center the resulting design
// TODO it mobile-friendly
function wherever() {
	function randomIntFromInterval(min, max) {
		return Math.random() * (max - min + 1) + min;
	}
	let midx = dynCanvasWidth () / 2;
	let midy = dynCanvasHeight() / 2;
	let randx = randomIntFromInterval(midx - midx * 0.3, midx + midx * 0.3);
	let randy = randomIntFromInterval(midy - midy * 0.3, midy + midy * 0.3);
	return new Point(randx, randy);
}

function dynCanvasWidth () { return window.innerWidth  * 0.777; }
function dynCanvasHeight() { return window.innerHeight * 0.777; }


/* =========================================================================== *
 *                                  ELECTIO                                    *
 * =========================================================================== */

// load the propositions dropdown depending on book
function loadProps(obj) {
	let propsTag = document.getElementById("props");
	// keep the "choose a prop" option
	while (propsTag.options.length > 1) { propsTag.remove(1); }
	let num = obj.options[obj.selectedIndex].value;
	if (!book[num]) {
		plaenController.indyObjects = [];
		return;
	}
	for (var prop in book[num]) {
		var opt = document.createElement("option");
		opt.text  = book[num][prop].text;
		opt.value = book[num][prop].uri;
		opt.title = book[num][prop].title;
		propsTag.appendChild(opt);
	}
}

// select a proposition from the dropdown
function selectProp(obj) {
	// clear previous content
	toMove = [];
	plaenController.objects = [];
	// load prop's steps
	var s = document.createElement("script");
	s.type = "text/javascript";
	s.src = "euclid-proofs-and-constructions/" + obj.value;
	// or to be exact: + obj.options[obj.selectedIndex].value;
	document.getElementById("propScript").innerHTML = "";
	document.getElementById("propScript").appendChild(s);
	plaenController.indyObjects = [];
	plaenController.addObject(
		new Text(obj.options[obj.selectedIndex].title)
	);
}

// true is next false is prev
function nextOrPrev(bool) {
	let propsTag = document.getElementById("props");
	let bookTag  = document.getElementById("books");
	try { bool ? stepForward() : stepBackward(); }
	catch (TypeError) {
		// cannot iterate over template placeholders 
		// clear previous content anyway
		plaenController.objects = [];
		toMove = [];
	}

	function stepForward() {
		// if end of props go to next book first prop
		if (propsTag.selectedIndex == propsTag.length - 1) {
			bookTag.selectedIndex  ==  bookTag.length - 1 ?
				bookTag.selectedIndex = 1 :
				bookTag.selectedIndex++;
			loadProps(bookTag);
			propsTag.selectedIndex = 1;
			selectProp(propsTag);
		} else {
			// else just next prop
			propsTag.selectedIndex++;
			selectProp(propsTag);
		}
	}
	function stepBackward() {
		// if start of props go to prev book last prop
		if (propsTag.selectedIndex <= 1) {
			bookTag.selectedIndex  <= 1 ?
				bookTag.selectedIndex = bookTag.length - 1 :
				bookTag.selectedIndex--;
			loadProps(bookTag);
			propsTag.selectedIndex = propsTag.length - 1;
			selectProp(propsTag);
		} else {
			// else just prev prop
			propsTag.selectedIndex--;
			selectProp(propsTag);
		}
	}
}


/* =========================================================================== *
 *                                KEY-SHORTCUTS                                *
 * =========================================================================== */

document.onkeydown = function (e) {
	e = e || window.event;
	switch (e.keyCode) {
		// right arrow key
		case 39: move(); break;
		// left  arrow key
		case 37: undo(); break;
		// letter r, for reload
		case 82:
			let p = document.getElementById("props");
			selectProp(p); break;
		// letter n, for next
		case 78:
			nextOrPrev(true); break;
		// letter p, for previous
		case 80:
			nextOrPrev(false); break;
	}
}

// list to be filled with the steps of each proposition
var toMove = [];

function move() {
	if (toMove.length == 0) 
		return;
	if (Array.isArray(toMove[0])){
		bootstrap(toMove.shift());
		return;
	}
	plaenController.addObject(toMove.shift());
}

function undo() {
	if (plaenController.objects.length == 0) return;
	moveAgain = plaenController.objects.pop();
	toMove.unshift(moveAgain);
}


/* =========================================================================== *
 *                              LINE-INTERSECTIONS                             *
 * =========================================================================== */

function segRayHelper(line, scale) {
	if (line.ray)     { return scale > 0; }
	if (line.segment) { return between(scale, 0, 1); }
	return true;
}

let lineIntersections = {
	lineWithLine: function lwl(my, your) {
		if (my.x == undefined && your.x == undefined) {
			if (my.slope == your.slope)
				return [];
			let c = new Point();
			c.x = (your.y_intercept - my.y_intercept) /
				(my.slope - your.slope);
			c.y = my.slope * c.x + my.y_intercept;
			return [c];
		}
		if (my.x != undefined && your.x != undefined)
			return [];
		if (your.x != undefined)
			return your.intersect(my);
		if (my.x != undefined) {
			let c = new Point();
			c.x = my.x;
			c.y = your.slope * my.x + your.y_intercept;
			return [c];
		}
		return [];
	},
	lineWithCircle: function lwc(my, your) {
		if (my.x != undefined) {
			return this.lineParalleltoYandCircle(my, your);
		}
		return this.lineWithSlopeAndCircle(my, your);
	},
	lineParalleltoYandCircle: function lpyc(my, your) {
		let a =   1;
		let b = - 2 * your.o.y;
		let c = - square(your.r)
			+ square(your.o.x - my.x)
			+ square(your.o.y);
		let w = b * b - 4 * a * c;
		if (w < 0) return [];
		w = Math.sqrt(w);
		let y1 = (-b + w) / (2 * a);
		let y2 = (-b - w) / (2 * a);
		if (y1 != y2) return [new Point(my.x, y1), new Point(my.x, y2)];
		return [new Point(my.x, y1)];
	},
	lineWithSlopeAndCircle: function lwsc(my, your) {
		let a = my.slope * my.slope + 1;
		let b = - 2 * your.o.x
			+ 2 * my.slope * my.y_intercept
			- 2 * your.o.y * my.slope;
		let c =   square(your.o.x)
		        + square(my.y_intercept)
		 	+ square(your.o.y)
		        - square(your.r)
		        - 2 * my.y_intercept * your.o.y;
		let w = b * b - 4 * a * c;
		if (w < 0) return [];
		w = Math.sqrt(w);
		let x1 = (-b + w) / (2 * a);
		let x2 = (-b - w) / (2 * a)
		let p1 = new Point();
		p1.x = x1;
		p1.y = x1 * my.slope + my.y_intercept;
		if (x1 != x2) {
			let p2 = new Point();
			p2.x = x2;
			p2.y = x2 * my.slope + my.y_intercept;
			return [p1, p2];
		}
		return [p1];
	},
	segsAndRays: function sar(my, your) {
		/* 
		 *  We'll use line's parametric equations
		 *  we start with 
		 *  p + t r = q + u s
		 *  where p,r,q,s are vectors
		 *  and t and u are scalar parameters
		 *  then (p + t r) × s = (q + u s) × s
		 *  (where x is the cross product)
		 *  s x s = 0 -> solve for t
		 *  t x t = 0 -> solve for u 
		 */

		let firstVec = my.a.vectorTo(my.b);
		let secVec = your.a.vectorTo(your.b);

		// First step in searching mutual scales
		let tempVec = my.a.vectorTo(your.a);
		let checkDenom = firstVec.vectorCrossProd(secVec);

		if (checkDenom == 0) { return [] };

		let firstScale = tempVec.vectorCrossProd(secVec) / checkDenom;
		let secScale = tempVec.vectorCrossProd(firstVec) / checkDenom;

		if (segRayHelper(my, firstScale) && segRayHelper(your, secScale)) {
			// steps towards finding point of intersection	
			// scale first point of whichever segment with its parameter
			let toAdd = firstVec.scale(firstScale);
			return [my.a.add(toAdd)];
		} else {
			return [];
		}
	},
	segRayCircle: function src(my, your) {
		let d = my.a.vectorTo(my.b);
		let f = your.o.vectorTo(my.a);
		/*
		 *  After plugging line's parametric equations:
		 *  p = my.a + d * t ->
		 *  Px = my.a.x + t*d.x, Py = my.a.y + t*d.y
		 *  into circle's general equation x,y: 
		 *  (x - h)**2 + (y - k)**2 = r**2
		 *  (where h,k the center of circle)
		 *  after much expansion we get:
		 *  (d.d) * t**2 + (f.d) * 2t + (f.f - r**2) = 0
		 *  where . is the dot product
		 *  consequently:
		 */
		let a = d.vectorDotProd(d);
		let b = 2 * f.vectorDotProd(d);
		let c = f.vectorDotProd(f) - square(your.r);

		let discriminant = b * b - 4 * a * c;

		if (discriminant <  0) { return []; }
		if (discriminant == 0) {
			let t = -b / (2 * a);
			if (segRayHelper(my, t)) {
				let toAdd = d.scale(t);
				return [my.a.add(toAdd)];
			}
		}
		if (discriminant > 0) {
			discriminant = Math.sqrt(discriminant);
			let t1 = (-b - discriminant) / (2 * a);
			let t2 = (-b + discriminant) / (2 * a);
			let ints = [];
			if (segRayHelper(my, t1)) {
				let toAdd = d.scale(t1);
				ints.push(my.a.add(toAdd));
			}
			if (segRayHelper(my, t2)) {
				let toAdd = d.scale(t2);
				ints.push(my.a.add(toAdd));
			}
			return ints;
		}
	}
}


/* =========================================================================== *
 *                                    LIBRI                                    *
 * =========================================================================== */

var book = {
	"1": {
		"prop1": {
			"uri": "book1/1.1_equilateral-triangle.js",
			"text": "Prop 1",
			"title": "1.1 Equilateral Triangle",
			"gist": function (line, color) {
				var the1Circle = Circle.defineTwoPoint(line.b, line.a);
				var the2Circle = Circle.defineTwoPoint(line.a, line.b);
				var cut = the1Circle.intersect(the2Circle)[0];
				var equiSide1 = Line.defineSegment(line.a, cut, color);
				var equiSide2 = Line.defineSegment(cut, line.b, color);
				var equiSide3 = Line.defineSegment(line.a, line.b, color);
				return [equiSide3.a, equiSide3.b, cut, equiSide1, equiSide2, equiSide3];
			}
		},
		"prop2": {
			"uri": "book1/1.2_equal-line-from-point.js",
			"text": "Prop 2",
			"title": "1.2 Equal Line From Point",
			"gist": function (line, point, color) {
				var theEquiCircle1 = Circle.defineTwoPoint(point, line.a);
				var theEquiCircle2 = Circle.defineTwoPoint(line.a, point);
				var equiCut = theEquiCircle1.intersect(theEquiCircle2)[0];
				var ray1 = Line.defineRay(equiCut, line.a);
				var ray2 = Line.defineRay(equiCut, point);
				var circle1 = Circle.defineTwoPoint(line.a, line.b);
				var rayCut = circle1.intersect(ray1)[0];
				var circle2 = Circle.defineTwoPoint(equiCut, rayCut);
				var finalPoint = circle2.intersect(ray2)[0];
				var finalSegment = Line.defineSegment(point, finalPoint, color);
				return [finalSegment];
			}
		},
		"prop3": {
			"uri": "book1/1.3_greater-equal-to-lesser.js",
			"text": "Prop 3",
			"title": "1.3 Make Greater Equal To Lesser",
			"gist": function () { }
		},
		"prop4": {
			"uri": "book1/1.4_equal-triangles.js",
			"text": "Prop 4",
			"title": "1.4 Two Sides & Containing Angle",
			"gist": function () { }
		}
	},
	"2": {
		"prop1": {
			"uri": "placeholder.js",
			"text": "tmp 1",
			"title": "2.1 placeholder",
			"gist": function () { }
		},
		"prop2": {
			"uri": "placeholder.js",
			"text": "tmp 2",
			"title": "2.2 placeholder",
			"gist": function () { }
		}
	}
};
