import h from 'react-hyperscript'
import {path} from 'd3-path'

interface BezierControlPoint {
  x: number,
  y: number
}

interface BezierPoint {
  x: number,
  y: number,
  controlPoint?: BezierControlPoint
}

interface BezierComponentProps {
  points: BezierPoint[]
}

const BezierEditComponent = (props: BezierComponentProps)=>{
  const {points} = props
  const p = path()
  const p1: BezierPoint = {
    x: 100,
    y: 100
  }
  const p2: BezierPoint = {x: 400, y: 400}

  let c1: BezierControlPoint = {...p1}
  c1.x += 200

  let c2: BezierControlPoint = {...p2}
  c2.x -= 200
  c2.y -= 50

  p.moveTo(p1.x, p1.y)
  p.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y)

  return h('path', {
    d: p.toString(),
    stroke: "#888888",
    fill: 'none',
    strokeWidth: "2px"
  })
}

export {BezierEditComponent}
