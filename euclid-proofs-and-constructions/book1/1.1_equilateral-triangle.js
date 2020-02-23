/* ================================== *
 *        Equilateral Triangle        *
 * ================================== */

var a = wherever();
var b = wherever();
var theLine = Line.defineSegment(a, b);

var the1Circle = Circle.defineTwoPoint(b, a);
var the2Circle = Circle.defineTwoPoint(a, b);
var cut = the1Circle.intersect(the2Circle)[0];

var equiSide1 = Line.defineSegment(a, cut, red);
var equiSide2 = Line.defineSegment(cut, b, red);
var equiSide3 = Line.defineSegment(a, b, red);

toMove = [a, b, theLine, the1Circle, the2Circle, cut, equiSide1, equiSide2, equiSide3];

// add console.assert
