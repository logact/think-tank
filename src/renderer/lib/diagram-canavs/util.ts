type Point = { x: number; y: number };
type Polygon = Point[];

/**
 * Determines if a point is inside a polygon using the x
 * @param point - The point to check.
 * @param polygon - The array of points representing the polygon vertices.
 * @returns `true` if the point is inside the polygon, otherwise `false`.
 */
export function isPointInPolygon(point: Point, polygon: Polygon): boolean {
    const { x: px, y: py } = point;
    let inside = false;

    const n = polygon.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
        const { x: x1, y: y1 } = polygon[i];
        const { x: x2, y: y2 } = polygon[j];

        // Check if the point is within the y-bounds of the edge
        const intersects = y1 > py !== y2 > py && px < ((x2 - x1) * (py - y1)) / (y2 - y1) + x1;
        if (intersects) {
            inside = !inside;
        }
    }

    return inside;
}
export function isLinesIntersect(a1: Point, a2: Point, b1: Point, b2: Point): boolean {
    const denominator =
        (a1.x - a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x - b2.x);

    // Lines are parallel or collinear
    if (denominator === 0) return false;

    const t =
        ((a1.x - b1.x) * (b1.y - b2.y) - (a1.y - b1.y) * (b1.x - b2.x)) /
        denominator;
    const u =
        ((a1.x - b1.x) * (a1.y - a2.y) - (a1.y - b1.y) * (a1.x - a2.x)) /
        denominator;

    // Check if the intersection point lies on both line segments
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function isLineClicked(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    mouseX: number,
    mouseY: number,
    tolerance: number = 5
): boolean {
    // 1. 检查点到直线的距离
    const distance = Math.abs((y2 - y1) * mouseX - (x2 - x1) * mouseY + x2 * y1 - y2 * x1) /
        Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);

    // 如果点到直线的距离大于容忍范围，直接返回 false
    if (distance > tolerance) return false;

    // 2. 检查点是否在线段范围内（投影点是否在线段上）
    const dotProduct = (mouseX - x1) * (x2 - x1) + (mouseY - y1) * (y2 - y1);
    const squaredLength = (x2 - x1) ** 2 + (y2 - y1) ** 2;

    // 如果点的投影在线段范围内，则点击有效
    return dotProduct >= 0 && dotProduct <= squaredLength;
}

export function isPointInLine(point: Point, lineStart: Point, lineEnd: Point, w: number):boolean {

    return isLineClicked(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y, point.x, point.y)
}
/**
 * could use the distance directly cause the condition of line with point with the line the distance will be 1
 * @param point 
 * @param lineStart 
 * @param lineEnd 
 * @returns 
 */
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

export function multiplyVectorByMatrix(vector: {x:number, y:number}, matrix: [number, number, number, number, number, number, number, number, number]): {x:number, y:number}{
    const {x, y} = vector;
    const [a, b, tx, c, d, ty] = matrix; // Destructuring the matrix

    // Matrix multiplication for 2D vector and affine transformation matrix
    const xNew = a * x + b * y + tx;
    const yNew = c * x + d * y + ty;
    return {
        "x":xNew,
        "y":yNew
    }

}