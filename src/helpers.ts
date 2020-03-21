enum Polarity {
  BEFORE = -1,
  AFTER = 1
}

function opposite(polarity: Polarity): Polarity {
  return polarity == Polarity.BEFORE ? Polarity.AFTER : Polarity.BEFORE
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

function pixelShift(cp: ControlPoint|null): Point {
  if (cp == null) return {x: 0, y: 0}
  const ra = cp.angle * Math.PI/180
  return {
    x: Math.cos(ra)*cp.length,
    y: Math.sin(ra)*cp.length
  }
}

// Transforms
function rotate(deg: number) {
  return `rotate(${deg})`
}

function translate(point: Point) {
  return `translate(${point.x} ${point.y})`
}

function isSmooth(ctl: BezierVertexControls): ctl is SmoothControlPoint {
  return (ctl as SmoothControlPoint).angle != null ? true : false
}

export {
  Polarity,
  expandControlPoint,
  getAngle,
  pixelShift,
  rotate,
  translate,
  opposite,
  isSmooth
}
