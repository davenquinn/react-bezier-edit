interface Point {
  x: number,
  y: number
}

interface ControlPoint {
  angle: number,
  length: number
}

interface SmoothControlPoint {
  angle: number,
  length: number|null,
  length1: number|null
}

type InflectionControlPoint = [ControlPoint|null, ControlPoint|null]
type BezierVertexControls = SmoothControlPoint|InflectionControlPoint|null

interface BezierPoint extends Point {
  controlPoint: BezierVertexControls
}

interface BezierCurve {
  points: BezierPoint[]
}

declare enum EditMode {
  EXTEND = 'extend'
}

interface EditableBezierCurve extends BezierCurve {
  editMode: EditMode|null
}
