import {hyperStyled} from '@macrostrat/hyper'
import {
  useBezier,
  useDispatch
} from '../state-manager'
import {generatePath} from '../path-data'
import {Polarity, getAngle, rotate} from '../helpers'
import styles from '../main.styl'

const h = hyperStyled(styles)

interface EndpointControlProps {
  polarity: Polarity,
  angle: number
}

const ExtendPlaceholder = (props: EndpointControlProps)=>{
  const {angle, polarity} = props
  const cx = 20*polarity
  const dispatch = useDispatch()
  const onClick = ()=>{
    dispatch({type: 'enter-extend-mode', polarity})
  }

  const transform = rotate(angle)

  return h("g.endpoint-control", {transform}, [
    h("circle.enter-edit-mode", {cx, r: 5, onClick})
  ])
}

const ExtendedPath = (props: {point: BezierPoint, angle: number})=>{
  const {point, angle} = props
  const {proposedVertex} = useBezier()
  if (proposedVertex == null) return null

  let length = point.controlPoint?.length ?? -point.controlPoint?.length1 ?? 0
  const controlPoint = {length, angle, length1: length}
  const p1: BezierPoint = {x:0, y: 0, controlPoint}
  const p2 = {
    x: proposedVertex.x-point.x,
    // Weird extra factor
    y: proposedVertex.y-point.y,
    controlPoint: null
  }
  const pathData = [p1,p2]
  console.log(pathData)

  const p = generatePath(pathData)
  console.log(p.toString())


  return h('path', {
    d: p.toString(),
    stroke: "#888888",
    fill: 'none',
    strokeWidth: "2px",
    strokeDasharray: "2 2"
  })
}

type ExtProps = {index: number}
const BezierExtensionControl = (props: ExtProps)=>{
  const {index} = props
  const {points, editMode} = useBezier()
  const point = points[index]
  const inExtendMode = editMode?.mode == "extend"

  const isStart = index == 0;
  const isEnd = index == points.length-1
  if (!isStart && !isEnd) return null

  const polarity = isStart ? Polarity.BEFORE : Polarity.AFTER
  const angle = getAngle(point, polarity)

  const activeExtendMode = editMode?.polarity == polarity

  return h([
    h.if(!inExtendMode)(ExtendPlaceholder, {angle, polarity})
    h.if(inExtendMode && activeExtendMode)(ExtendedPath, {point, angle})
  ])
}

export {BezierExtensionControl}
