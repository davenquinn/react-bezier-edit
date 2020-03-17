import {hyperStyled} from '@macrostrat/hyper'
import {DraggableCore, DraggableEventHandler} from 'react-draggable'
import {
  BezierEditorProvider,
  useCurve,
  useDispatch
} from './state-manager'
import {usePathGenerator} from './path-data'
import {expandControlPoint, Polarity, getAngle} from './helpers'
import styles from './main.styl'

function rotate(deg: number) {
  return `rotate(${deg})`
}

function translate(point: Point) {
  return `translate(${point.x} ${point.y})`
}


const h = hyperStyled(styles)

const BezierPath = ()=>{
  const p = usePathGenerator()

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
  return h("g.bezier-handle", {transform: rotate(c1.angle)}, [
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

interface EndpointControlProps {
  polarity: Polarity,
  angle: number
}

const BezierEndpointControl = (props: EndpointControlProps)=>{
  const {angle, polarity} = props
  const cx = 20*polarity
  const onClick = ()=>{}

  const transform = rotate(angle)

  return h("g.endpoint-control", {transform}, [
    h("circle.enter-edit-mode", {cx, r: 5, onClick})
  ])
}

interface BezierPointProps {
  point: BezierPoint,
  index: number
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
    transform: translate(point)
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
