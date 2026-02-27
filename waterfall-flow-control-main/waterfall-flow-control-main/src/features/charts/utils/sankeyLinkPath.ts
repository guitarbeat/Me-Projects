import * as d3 from 'd3';

/**
 * Improved Sankey link path function based on Stack Overflow solution
 * This function is a drop in replacement for d3.sankeyLinkHorizontal() or d3.sankeyLinkVertical().
 * It creates smooth, properly closed paths without unwanted circles.
 */
export function sankeyLinkPath(
  link: {
    source: { x1: number };
    target: { x0: number };
    y0: number;
    y1: number;
    width: number;
  },
  isVertical: boolean = false
): string {
  if (isVertical) {
    // Vertical layout - flow from top to bottom
    // Start and end of the link
    const sy1 = link.source.x1;
    const ty0 = link.target.x0 + 1;

    // All four outer corners of the link
    // where e.g. lsx0 is the right corner of the link on the source side
    const lsx0 = link.y0 - link.width / 2;
    const lsx1 = link.y0 + link.width / 2;
    const ltx0 = link.y1 - link.width / 2;
    const ltx1 = link.y1 + link.width / 2;

    // Center (y) of the link
    const lcy = sy1 + (ty0 - sy1) / 2;

    // Define outline of link as path
    const path = d3.path();
    path.moveTo(lsx0, sy1);
    path.bezierCurveTo(lsx0, lcy, ltx0, lcy, ltx0, ty0);
    path.lineTo(ltx1, ty0);
    path.bezierCurveTo(ltx1, lcy, lsx1, lcy, lsx1, sy1);
    path.lineTo(lsx0, sy1);
    return path.toString();
  } else {
    // Horizontal layout - flow from left to right
    // Start and end of the link
    const sx1 = link.source.x1;
    const tx0 = link.target.x0 + 1;

    // All four outer corners of the link
    // where e.g. lsx0 is the left corner of the link on the source side
    const lsx0 = link.y0 - link.width / 2;
    const lsx1 = link.y0 + link.width / 2;
    const ltx0 = link.y1 - link.width / 2;
    const ltx1 = link.y1 + link.width / 2;

    // Center (x) of the link
    const lcx = sx1 + (tx0 - sx1) / 2;

    // Define outline of link as path
    const path = d3.path();
    path.moveTo(sx1, lsx0);
    path.bezierCurveTo(lcx, lsx0, lcx, ltx0, tx0, ltx0);
    path.lineTo(tx0, ltx1);
    path.bezierCurveTo(lcx, ltx1, lcx, lsx1, sx1, lsx1);
    path.lineTo(sx1, lsx0);
    return path.toString();
  }
}
