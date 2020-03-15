import {hyperStyled} from '@macrostrat/hyper'
import {path} from 'd3-path'
import {pairs} from 'd3-array'
import styles from './main.styl'
import Bezier from 'bezier-js'

const h = hyperStyled(styles)

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

interface BezierComponentProps {
  points: BezierPoint[]
}

function pixelShift(cp: ControlPoint|null): Point {
  if (cp == null) return {x: 0, y: 0}
  const ra = cp.angle * Math.PI/180
  return {
    x: Math.cos(ra)*cp.length,
    y: Math.sin(ra)*cp.length
  }
}

const BezierPath = (props: BezierComponentProps)=>{
  const {points} = props

  let p = path()
  p.moveTo(points[0].x, points[0].y)

  for (const [p1, p2] of pairs(points)) {

    const c1 = pixelShift(expandControlPoint(p1.controlPoint)[1])
    const c2 = pixelShift(expandControlPoint(p2.controlPoint)[0])


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
  point: BezierPoint,
  isStartPoint: boolean,
  isEndPoint: boolean
}

const BezierHandle = (props: {controlPoint: ControlPoint|null})=>{
  const {controlPoint: c1} = props
  if (c1?.length == null) return null
  return h("g.bezier-handle", {transform: `rotate(${c1.angle})`}, [
    h('line.bezier-control-arm', {x2: c1.length}),
    h('circle.bezier-control-point', {cx: c1.length, r: 3})
  ])
}

const SmoothHandles = (props: {controlPoint: SmoothControlPoint})=>{
  const {angle, length, length1} = props.controlPoint;
  return h("g.bezier-smooth-handle", [
    h(BezierHandle, {controlPoint: {angle, length}}),
    h(BezierHandle, {controlPoint: {angle: -angle, length: length1}})
  ])
}

type BezierHandlesProps = {controlPoint: BezierVertexControls}

const BezierHandles = (props: BezierHandlesProps)=>{
  const controlPoints = expandControlPoint(props.controlPoint)
  return h("g.bezier-handles", controlPoints.map(d => h(
    BezierHandle, {controlPoint: d}
  )))
}

const BezierPoint = (props: ControlPointProps)=>{
  const {point, isStartPoint, isEndPoint} = props
  const {controlPoint} = point

  return h("g.bezier-node", {transform: `translate(${point.x} ${point.y})`}, [
    h(BezierHandles, {controlPoint}),
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

const BezierEditComponent = ()=>{
  const points = [
    {x: 100, y: 100, controlPoint: {angle: 0, length1: 200}},
    {x: 400, y: 400, controlPoint: {length: 200, angle: 0, length1: 200}},
    {x: 500, y: 300, controlPoint: {length: 200, angle: 0}}
  ]

  return h("g.bezier-edit", [
    h(BezierPath, {points}),
    h(BezierPoints, {points})
  ])
}

export {BezierEditComponent}
