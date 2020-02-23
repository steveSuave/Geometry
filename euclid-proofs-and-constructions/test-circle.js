var o = new Point(384, 201);
var b = new Point(287, 192);
// var r = o.dist(b);

var circ = Circle.defineTwoPoint(o, b, blue);

var c = new Point(276, 114);
var d = new Point(357, 191);
var seg = Line.defineRay(c, d, green);

var testPoint = circ.intersect(seg)[0];
var testPoint2 = circ.intersect(seg)[1];
console.log(testPoint);

if (testPoint == undefined) {
    var toMove = [o, b, circ, c, d, seg];
} else if(testPoint2 == undefined){
    var toMove = [o, b, circ, c, d, seg, testPoint];
} else {
    var toMove = [o, b, circ, c, d, seg, testPoint, testPoint2];
}
