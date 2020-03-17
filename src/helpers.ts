enum Polarity {
  BEFORE = -1,
  AFTER = 1
}

// Helpers
function expandControlPoint(cp: BezierVertexControls): InflectionControlPoint {
  if (cp == null) return [null, null];
  if (Array.isArray(cp)) {
    return cp
  } else {
    const {length, length1, angle} = cp
    return [
      length == null ? null : {length: -length, angle},
      length1 == null ? null : {length: length1, angle}
    ]
  }
}

function controlForPolarity(point: BezierPoint, polarity: Polarity): ControlPoint|null {
  const ix = polarity < 1 ? 0 : 1
  return expandControlPoint(point.controlPoint)[ix]
}

const getAngle = (point: BezierPoint, polarity: Polarity):number =>{
  let c = controlForPolarity(point, polarity)
  if (c == null) c = controlForPolarity(point, -polarity)
  return c?.angle ?? 0
}

export {Polarity, expandControlPoint, getAngle}
