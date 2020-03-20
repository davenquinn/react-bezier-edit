import {hyperStyled} from '@macrostrat/hyper'
import {DraggableCore, DraggableEventHandler} from 'react-draggable'
import {
  usePoints,
  useDispatch,
} from '../state-manager'
import {generatePath} from '../path-data'
import {expandControlPoint, Polarity, rotate, translate} from '../helpers'
import {BezierExtensionControl} from './extend'
import styles from '../main.styl'

const h = hyperStyled(styles)

interface DragCircleProps extends Omit<React.SVGProps<SVGElement>,"onDrag"> {
  onDrag: DraggableEventHandler
}

const DraggableCircle = (props: DragCircleProps)=>{
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

interface BezierPointProps {
  point: BezierPoint
}

const BezierPoint = (props: BezierPointProps)=>{
  const {point} = props
  const editable = true
  const className = editable ? "editable" : null
  const index = usePoints().findIndex(d => point == d)
  const dispatch = useDispatch()

  const onDrag: DraggableEventHandler = (e, data)=>{
    if (index == -1) return false
    dispatch({type: 'drag-vertex', data, index})
  }

  return h("g.bezier-node", {
    className,
    transform: translate(point)
  }, [
    h(DraggableCircle, {onDrag, className: 'bezier-point', r: 5}),
    h(BezierHandles, {point, index}),
    h(BezierExtensionControl, {index})
  ])
}

BezierPoint.defaultProps = {
  isStartPoint: false,
  isEndPoint: false
}

interface BezierProps {
  points?: BezierPoint[]
}
type BezierCurveProps = Omit<React.SVGProps<SVGElement>,"points"> & BezierProps

const BezierPoints = (props: BezierProps)=>{
  const points = props.points ?? usePoints()
  return h("g.points", points.map((point: BezierPoint, index: number)=>{
    return h(BezierPoint, {point, index})
  }))
}

const BezierPath = (props: BezierCurveProps)=>{
  const {points, ...rest} = props
  const p = generatePath(points ?? usePoints())
  return h('path.bezier-path', {d: p.toString(), ...rest})
}

const BezierCurve = (props: BezierCurveProps)=>{
  const {points, children, ...rest} = props
  return h("g.bezier-curve", {...rest}, [
    children,
    h(BezierPath, {points}),
    h(BezierPoints, {points})
  ])
}

export {
  BezierPoints,
  BezierPath,
  BezierCurve,
  BezierCurveProps
}
