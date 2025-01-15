
type Point = { x: number; y: number };
type Polygon = Point[];
import * as Util from "../diagram-canavs/util"

function distanceFromPointToLine(point: Point, lineStart: Point, lineEnd: Point): number {
    const { x: x0, y: y0 } = point;
    const { x: x1, y: y1 } = lineStart;
    const { x: x2, y: y2 } = lineEnd;

    // Line coefficients
    const A = y2 - y1;
    const B = x1 - x2;
    const C = x2 * y1 - x1 * y2;

    // Distance calculation
    const numerator = Math.abs(A * x0 + B * y0 + C);
    const denominator = Math.sqrt(A ** 2 + B ** 2);


    // Prevent division by zero for a degenerate line (both points are the same)
    if (denominator === 0) {
        throw new Error("Invalid line: Start and end points are the same.");
    }

    return numerator / denominator;
}
describe("test the distance algorithm", () => {
    test("should bigger than 5", () => {
        // console.log(distanceFromPointToLine({ "x": 85, "y": 750 }, { "x": 150, "y": 773 }, { "x": 200, "y": 748 }))
        // const res = Util.isPointInLine({ "x": 85, "y": 750 }, { "x": 150, "y": 773 }, { "x": 200, "y": 748 }, 5)
        const res1 = distanceFromPointToLine({ "x": 85, "y": 750 }, { "x": 150, "y": 773 }, { "x": 200, "y": 748 })
        const res2 = distanceFromPointToLine({ "x": 169, "y": 749 }, { "x": 1050, "y": 748 }, { "x": 1100, "y": 748 })
        console.log(res1)
        console.log(res2)
    })

})

