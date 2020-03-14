import {hyperStyled} from '@macrostrat/hyper'
import {path} from 'd3-path'
import {pairs} from 'd3-array'
import styles from './main.styl'

const h = hyperStyled(styles)

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

function negate(controlPoint: BezierControlPoint): BezierControlPoint {
  return {x: -controlPoint.x, y: -controlPoint.y}
}

const BezierPath = (props: BezierComponentProps)=>{
  const {points} = props

  let p = path()
  p.moveTo(points[0].x, points[0].y)

  for (const [p1, p2] of pairs(points)) {

    let c1 = p1.controlPoint ?? {x: 0, y: 0}
    let c2 = negate(p2.controlPoint) ?? {x: 0, y: 0}

    p.bezierCurveTo(
      p1.x+c1.x,
      p1.y+c1.y,
      p2.x+c2.x,
      p2.y+c2.y,
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
  point: BezierPoint
}

const BezierControlPoint = (props: ControlPointProps)=>{
  const {point} = props
  return h("circle.bezier-control-point", {cx: point.x, cy: point.y, r: 5})
}

const BezierPoints = (props: BezierComponentProps)=>{
  const {points} = props
  return h("g.points", points.map(point =>{
    return h(BezierControlPoint, {point})
  }))
}

const BezierEditComponent = (props)=>{
  const points = [
    {x: 100, y: 100, controlPoint: {x: 200, y: 0}},
    {x: 400, y: 400, controlPoint: {x: 200, y: 0}},
    {x: 500, y: 300, controlPoint: {x: 200, y: 0}}
  ]

  return h("g.bezier-edit", [
    h(BezierPath, {points}),
    h(BezierPoints, {points})
  ])
}

export {BezierEditComponent}
