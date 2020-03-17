import {hyperStyled} from '@macrostrat/hyper'
import {useState} from 'react'
import update, {Spec} from 'immutability-helper'
import {DraggableCore, DraggableEventHandler} from 'react-draggable'
import {path} from 'd3-path'
import {pairs} from 'd3-array'
import {
  BezierEditorProvider,
  Polarity,
  useCurve, useDispatch} from './state-manager'
import styles from './main.styl'

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

type PointsSpec = Spec<BezierPoint[]>

function pixelShift(cp: ControlPoint|null): Point {
  if (cp == null) return {x: 0, y: 0}
  const ra = cp.angle * Math.PI/180
  return {
    x: Math.cos(ra)*cp.length,
    y: Math.sin(ra)*cp.length
  }
}

const BezierPath = ()=>{
  const points = useCurve()

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

const DraggableCircle = (props)=>{
  const {onDrag, ...rest} = props
  return h(DraggableCore, {
    onDrag,
    offsetParent: document.querySelector("svg")
  }, (
    h("circle.draggable", {...rest})
  ))
}

interface BezierHandleProps {
  controlPoint: ControlPoint|null,
  onDrag: DraggableEventHandler
}

const BezierHandle = (props: BezierHandleProps)=>{
  const {controlPoint: c1, onDrag} = props

  if (c1?.length == null) return null
  return h("g.bezier-handle", {transform: `rotate(${c1.angle})`}, [
    h('line.bezier-control-arm', {x2: c1.length}),
    h(DraggableCircle, {
      className: '.bezier-control-point',
      onDrag,
      cx: c1.length,
      r: 3
    })
  ])
}

type BezierHandlesProps = {
  point: BezierPoint,
  index: number
}

const BezierHandles = (props: BezierHandlesProps)=>{
  const {index, point} = props
  const dispatch = useDispatch()

  const controlPoints = expandControlPoint(point.controlPoint)
  return h("g.bezier-handles", controlPoints.map((d,i)=> {

    const polarity = i < 1 ? Polarity.BEFORE : Polarity.AFTER

    const onDrag: DraggableEventHandler = (e, data)=>{
      dispatch({type: 'drag-handle', index, data, polarity})
    }

    return h(BezierHandle, {
      controlPoint: d,
      onDrag
    })
  }))
}

const rotate = (deg: number)=>{
  return `rotate(${deg})`
}

interface EndpointControlProps {
  polarity: Polarity,
  angle: number
}

const BezierEndpointControl = (props: EndpointControlProps)=>{
  const {angle, polarity} = props
  const cx = 20*polarity
  const onClick = ()=>{}

  return h("g.endpoint-control", {transform: rotate(angle)}, [
    h("circle.enter-edit-mode", {cx, r: 5, onClick})
  ])
}

interface BezierPointProps {
  point: BezierPoint,
  index: number
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

const BezierPoint = (props: BezierPointProps)=>{
  const {index} = props
  const editable = true
  const className = editable ? "editable" : null

  const points = useCurve()
  const point = points[index]
  const dispatch = useDispatch()

  const isStartPoint = index == 0;
  const isEndPoint = index == points.length-1

  const onDrag: DraggableEventHandler = (e, data)=>{
    dispatch({type: 'drag-vertex', data, index})
  }

  const hasEnter = isStartPoint || isEndPoint

  let polarity = Polarity.BEFORE
  if (isEndPoint) polarity = Polarity.AFTER
  const angle = getAngle(point, polarity)

  return h("g.bezier-node", {
    className,
    transform: `translate(${point.x} ${point.y})`
  }, [
    h(DraggableCircle, {onDrag, className: 'bezier-point', r: 5}),
    h(BezierHandles, {point, index}),
    h.if(hasEnter)(BezierEndpointControl, {angle, polarity})
  ])
}

BezierPoint.defaultProps = {
  isStartPoint: false,
  isEndPoint: false
}

const BezierPoints = ()=>{
  const points = useCurve()
  return h("g.points", points.map((point, index) =>{
    return h(BezierPoint, {point, index})
  }))
}

const BezierEditComponent = ()=>{
  const initialData = [
    {x: 100, y: 100, controlPoint: {angle: 0, length1: 200, length: null}},
    {x: 400, y: 400, controlPoint: {length: 200, angle: 0, length1: 200}},
    {x: 500, y: 300, controlPoint: {length: 200, angle: 0, length1: null}}
  ]
  return h(BezierEditorProvider, {initialData}, [
    h("g.editable-bezier", [
      h(BezierPath),
      h(BezierPoints)
    ])
  ])
}

export {BezierEditComponent}
