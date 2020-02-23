var a = new Point(116, 112);
var b = new Point(236, 254);
var segment = Line.defineSegment(a, b, red);

var c = new Point(249, 166);
var d = new Point(382, 120);
var linea = Line.defineTwoPoints(c, d, green);

// var c = new Point(91, 217);
// var d = new Point(382, 120);
// var linea = Line.defineTwoPoints(c, d, green);
//--
// var c = new Point(138, 266);
// var d = new Point(715, 289);
// var linea = Line.defineTwoPoints(c, d, green);

var testPoint = linea.intersect(segment)[0];
console.log(testPoint);

if (testPoint == undefined) {
    var toMove = [a, b, segment, c, d, linea];
} else {
    var toMove = [a, b, segment, c, d, linea, testPoint];
}

// var a = new Point(158, 93);
// var b = new Point(405, 132);
// var initialSegment = Line.defineTwoPoints(a, b, red);

// var c = new Point(186, 300);
// var d = new Point(484, 218);
// var secondSegment = Line.defineTwoPoints(c, d, green);

// var testPoint = initialSegment.intersect(secondSegment)[0];

// var a = new Point(158, 93);
// var b = new Point(405, 132);
// var initialSegment = Line.defineSegment(a, b, red);

// var c = new Point(186, 300);
// var d = new Point(484, 218);
// var secondSegment = Line.defineSegment(c, d, green);


