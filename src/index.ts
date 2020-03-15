import {hyperStyled} from '@macrostrat/hyper'
import {path} from 'd3-path'
import {pairs} from 'd3-array'
import styles from './main.styl'

const h = hyperStyled(styles)

function negate(controlPoint: BezierControlPoint): BezierControlPoint {
  return {dx: -controlPoint.dx, dy: -controlPoint.dy}
}

const BezierPath = (props: BezierComponentProps)=>{
  const {points} = props

  let p = path()
  p.moveTo(points[0].x, points[0].y)

  for (const [p1, p2] of pairs(points)) {

    let c1 = p1.controlPoint ?? {dx: 0, dy: 0}
    let c2 = negate(p2.controlPoint) ?? {dx: 0, dy: 0}

    p.bezierCurveTo(
      p1.x+c1.dx,
      p1.y+c1.dy,
      p2.x+c2.dx,
      p2.y+c2.dy,
      p2.x,
      p2.y)
  }

  return h('path', {
    d: p.toString(),
    stroke: "#888888",
    fill: 'none',
    strokeWidth: "2px"
  })
}

interface ControlPointProps {
  point: BezierPoint,
  isStartPoint: boolean,
  isEndPoint: boolean
}

const leadingControl = function(pt: BezierPoint): Point|null {
  if (pt.controlPoint == null) {
    return null
  }
  const ctl = negate(pt.controlPoint)
  return {x: pt.x+ctl.dx, y: pt.y+ctl.dy}
}

const trailingControl = function(pt: BezierPoint): Point|null {
  if (pt.controlPoint == null) {
    return null
  }
  const ctl = pt.controlPoint
  return {x: pt.x+ctl.dx, y: pt.y+ctl.dy}
}

const BezierControlArm = (props)=>{
  const {controlPoint: c1} = props
  if (c1 == null) return null
  return h("g", [
    h('line.bezier-control-arm', {x1: 0, y1: 0, x2: c1.dx, y2: c1.dy}),
    h('circle.bezier-control-point', {cx: c1.dx, cy: c1.dy, r: 3})
  ])
}

const BezierPoint = (props: ControlPointProps)=>{
  const {point, isStartPoint, isEndPoint} = props
  const {controlPoint} = point

  const c1 = isStartPoint ? null : negate(controlPoint ?? {dx: 0, dy: 0})
  const c2 = isEndPoint ? null : controlPoint ?? {dx: 0, dy: 0}

  return h("g.bezier-node", {transform: `translate(${point.x} ${point.y})`}, [
    h.if(c1 != null)(BezierControlArm, {controlPoint: c1}),
    h.if(c2 != null)(BezierControlArm, {controlPoint: c2}),
    h("circle.bezier-point", {r: 5})
  ])
}

BezierPoint.defaultProps = {
  isStartPoint: false,
  isEndPoint: false
}

const BezierPoints = (props: BezierComponentProps)=>{
  const {points} = props
  return h("g.points", points.map((point, index) =>{
    const isStartPoint = index == 0;
    const isEndPoint = index == points.length-1
    return h(BezierPoint, {point, isStartPoint, isEndPoint})
  }))
}

const BezierEditComponent = (props)=>{
  const points = [
    {x: 100, y: 100, controlPoint: {dx: 200, dy: 0}},
    {x: 400, y: 400, controlPoint: {dx: 200, dy: 0}},
    {x: 500, y: 300, controlPoint: {dx: 200, dy: 0}}
  ]

  return h("g.bezier-edit", [
    h(BezierPath, {points}),
    h(BezierPoints, {points})
  ])
}

export {BezierEditComponent}
