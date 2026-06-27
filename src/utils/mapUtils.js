export function isPointInPolygon(point, vertices) {
    const x = point.x;
    const y = point.y;
    let inside = false;

    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].x;
        const yi = vertices[i].y;
        const xj = vertices[j].x;
        const yj = vertices[j].y;

        const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

export function findNodeAtPoint(nodes, x, y, threshold = 3) {
    return nodes.find((node) => Math.hypot(node.x - x, node.y - y) < threshold) || null;
}

export function findZoneAtPoint(zones, x, y) {
    const point = { x, y };
    return zones.find((zone) => isPointInPolygon(point, zone.vertices)) || null;
}
