interface Point {
  x: number,
  y: number
}

interface BezierControlPoint {
  dx: number,
  dy: number
}

interface BezierPoint extends Point {
  controlPoint?: BezierControlPoint
}

interface BezierComponentProps {
  points: BezierPoint[]
}
