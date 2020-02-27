/* ================================== *
 *        Equilateral Triangle        *
 * ================================== */

var a = wherever();
var b = wherever();
var theLine = Line.defineSegment(a, b);

bootstrap([a, b, theLine]);

var the1Circle = Circle.defineTwoPoint(b, a);
var the2Circle = Circle.defineTwoPoint(a, b);
var cut = the1Circle.intersect(the2Circle)[0];

var equiSide1 = Line.defineSegment(a, cut, RED);
var equiSide2 = Line.defineSegment(cut, b, RED);
var equiSide3 = Line.defineSegment(a, b, RED);

toMove = [the1Circle, the2Circle, cut, equiSide1, equiSide2, equiSide3];

console.assert(
    equiSide1.len() == equiSide2.len() &&
    equiSide1.len() == equiSide3.len()
);
