var a = new Point(175, 106);
var b = new Point(339, 325);
var segment = Line.defineSegment(a, b, red);

var d = new Point(390, 218);
var c = new Point(674, 108);
var ray = Line.defineRay(c, d, green);

var testPoint = segment.intersect(ray)[0];
console.log(testPoint);

if (testPoint == undefined) {
    var toMove = [a, b, segment, c, d, ray];
} else {
    var toMove = [a, b, segment, c, d, ray, testPoint];
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


