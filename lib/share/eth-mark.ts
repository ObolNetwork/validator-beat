/**
 * Ethereum eth-diamond logomark inside a brand-green circular badge — the same
 * lockup as public/icon.svg (green disc, light diamond), rendered inline.
 * Polygon points are the Wikimedia originals (native viewBox ≈ 256×417); the
 * opacity tiers preserve the 3D facets.
 *
 * @param cx           badge centre x, in the parent SVG's user units
 * @param cy           badge centre y
 * @param radius       badge radius in px
 * @param circleFill   disc colour (brand green)
 * @param diamondFill  diamond colour (light grey / white)
 */
export function ethBadge(
  cx: number,
  cy: number,
  radius: number,
  circleFill: string,
  diamondFill: string,
): string {
  // Diamond height ≈ 57% of the badge diameter (matches icon.svg's 0.7 scale).
  const s = (radius * 1.14) / 416.906;
  const tx = (cx - 127.96 * s).toFixed(2);
  const ty = (cy - 208.45 * s).toFixed(2);
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${circleFill}"/>
  <g transform="translate(${tx} ${ty}) scale(${s.toFixed(4)})" fill="${diamondFill}">
    <polygon opacity="1"    points="127.9611 0 125.1661 9.5 125.1661 285.168 127.9611 287.958 255.9231 212.32"/>
    <polygon opacity="0.6"  points="127.962 0 0 212.32 127.962 287.959 127.962 154.158"/>
    <polygon opacity="1"    points="127.9611 312.1866 126.3861 314.1066 126.3861 412.3056 127.9611 416.9066 255.9991 236.5866"/>
    <polygon opacity="0.6"  points="127.962 416.9052 127.962 312.1852 0 236.5852"/>
    <polygon opacity="0.45" points="127.9611 287.9577 255.9211 212.3207 127.9611 154.1587"/>
    <polygon opacity="0.8"  points="0.0009 212.3208 127.9609 287.9578 127.9609 154.1588"/>
  </g>`;
}
