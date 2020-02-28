/* ================================== *
 *            PlaceHolder             *
 * ================================== */

var ar = book[1].prop1.gist(Line.defineSegment(wherever(),wherever()));

var ang1 = new Angle(ar[0],ar[1],ar[2])
var ang2 = new Angle(ar[1],ar[0],ar[2])
var ang3 = new Angle(ar[2],ar[1],ar[0])

bootstrap(ar);
toMove=[ang1,ang2,ang3];

// for (var i=0; i<3; i++){
//     var p = wherever();
//     var q = wherever();
//     var l = Line.defineTwoPoints(p,q);
//     plaenController.addObject(l);
// }

// var ang1 = new Angle.defineTwoLines(plaenController.objects[0],plaenController.objects[1], 'small')
// var ang2 = new Angle.defineTwoLines(plaenController.objects[1],plaenController.objects[2], 'small')

// toMove=[ang1,ang2];

// add console.assert()
