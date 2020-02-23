var a = new Point(158, 93);
var b = new Point(405, 132);
var initialSegment = Line.defineSegment(a, b, red);

var c = new Point(164, 152);
var d = new Point(366, 71);
var secondSegment = Line.defineSegment(c, d, green);

// var testPoint = new Point(267.87226107226104, 110.34825174825176);

var testPoint = initialSegment.intersect(secondSegment)[0];
console.log(testPoint);

if (testPoint == undefined) {
    var toMove = [a, b, initialSegment, c, d, secondSegment];
} else {
    var toMove = [a, b, initialSegment, c, d, secondSegment, testPoint];
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


