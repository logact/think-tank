from math import sqrt

def point_to_line_distance(point, line_start, line_end):
    """
    Calculates the distance of a point to a line in 2D space.

    :param point: Tuple (x0, y0) representing the point.
    :param line_start: Tuple (x1, y1) representing the start point of the line.
    :param line_end: Tuple (x2, y2) representing the end point of the line.
    :return: The perpendicular distance from the point to the line.
    """
    x0, y0 = point
    x1, y1 = line_start
    x2, y2 = line_end

    # Line coefficients
    A = y2 - y1
    B = x1 - x2
    C = x2 * y1 - x1 * y2

    # Distance calculation
    numerator = abs(A * x0 + B * y0 + C)
    denominator = sqrt(A**2 + B**2)

    # Prevent division by zero for a degenerate line (both points are the same)
    if denominator == 0:
        raise ValueError("Invalid line: Start and end points are the same.")

    return numerator / denominator

# Example Usage
# 
point = (169,749)   # Point to check
line_start = (1050, 748)  # Line start
line_end = (1100,748 )  # Line end

distance = point_to_line_distance(point, line_start, line_end)
print(f"Distance: {distance}")  # Should output: 4
