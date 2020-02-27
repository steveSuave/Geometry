/* ================================== *
 *     Make Greater Equal To Lesser   *
 * ================================== */

var a = wherever();
var b = wherever();
var segmentA = Line.defineSegment(a, b, RED);

var c = wherever();
var d = wherever();
var segmentB = Line.defineSegment(c, d, BLUE);

function theComparer(l1, l2) {
    return l1.a.dist(l1.b) > l2.a.dist(l2.b) ? 
        [l1, l1.colour, l2, l2.colour] : 
        [l2, l2.colour, l1, l1.colour] ;
}
var theDecision = theComparer(segmentA, segmentB);

var theBig = theDecision[0];
theBig.colour = theDecision[1];
var theSmall = theDecision[2];
theSmall.colour = theDecision[3];

var difference = a.dist(b) < c.dist(d) ? a.dist(b) : c.dist(d);
var radius = new Point(theBig.a.x - difference, theBig.a.y);
var equalToB = Line.defineSegment(theBig.a, radius, theSmall.colour);
var theCircle = Circle.defineTwoPoint(theBig.a, radius);
var theCut = theCircle.intersect(theBig)[0];
var segment3 = Line.defineSegment(theBig.a, theCut, theSmall.colour);

toMove = [
   a, b, segmentA, c, d, segmentB, radius, equalToB, theCircle, theCut, segment3
];

console.assert(theSmall.len() == segment3.len());
