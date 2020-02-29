/* ================================== *
 *     Two Sides, Containing Angle    *
 * ================================== */

// first trig
var a = wherever();
var b = wherever();
var segmentA = Line.defineSegment(a, b, RED);

var c = a;
var d = wherever();
var segmentB = Line.defineSegment(c, d, GREEN);

var e = d;
var f = b;
var segmentC = Line.defineSegment(e, f);

var ang1 = new Angle(a, b, d, BLUE);


bootstrap([a, b, c, d, e, f, segmentA, segmentB, segmentC, ang1]);

var add = Math.max(
    parseInt(segmentA.len()), 
    parseInt(segmentB.len()), 
    parseInt(segmentC.len())
) * 0.7;

var toAdd = new Point(add, add);

// sec trig
var g = a.add(toAdd);
var h = b.add(toAdd);
var i = c.add(toAdd);
var j = d.add(toAdd);
var k = e.add(toAdd);
var l = f.add(toAdd);

var segmentD = Line.defineSegment(g, h, RED);
var segmentE = Line.defineSegment(i, j, GREEN);
var segmentF = Line.defineSegment(k, l);

var ang4 = new Angle(g, h, j, BLUE);

bootstrap([g, h, i, j, k, l, segmentD, segmentE, segmentF, ang4]);

toMove = [];

// console.assert();
