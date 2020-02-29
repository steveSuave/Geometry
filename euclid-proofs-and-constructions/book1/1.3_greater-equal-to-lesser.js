/* ================================== *
 *     Make Greater Equal To Lesser   *
 * ================================== */

var a = wherever();
var b = wherever();
var segmentA = Line.defineSegment(a, b, RED);

var c = wherever();
var d = wherever();
var segmentB = Line.defineSegment(c, d, BLUE);

bootstrap([a, b, segmentA, c, d, segmentB]);

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

var equalToB = book[1].prop2.gist(theSmall, theBig.a, theSmall.colour)[0];

var theCircle = Circle.defineTwoPoint(theBig.a, equalToB.b);
var theCut = theCircle.intersect(theBig)[0];
var segment3 = Line.defineSegment(theBig.a, theCut, theSmall.colour);

toMove = [
   [equalToB.b, equalToB], theCircle, theCut, segment3
];

console.assert(theSmall.len() == segment3.len());
