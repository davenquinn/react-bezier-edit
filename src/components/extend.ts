import {hyperStyled} from '@macrostrat/hyper'
import {
  useBezier,
  useDispatch
} from '../state-manager'
import {generatePath} from '../path-data'
import {Polarity, getAngle, rotate} from '../helpers'
import {BezierCurve} from './curve'
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

const ExtendedPath = ()=>{
  const {points, editMode, proposedVertex} = useBezier()
  const inExtendMode = editMode?.mode == "extend"
  if (!inExtendMode) return null
  if (editMode?.polarity == null) return null
  const {polarity} = editMode
  const index = polarity == Polarity.BEFORE ? 0 : points.length-1
  const point = points[index]
  const angle = getAngle(point, polarity)

  if (proposedVertex == null) return null

  let length = point.controlPoint?.length ?? -(point.controlPoint?.length1 ?? 0)
  const controlPoint = {length, angle, length1: length}
  const p1: BezierPoint = {...point, controlPoint}
  const p2 = proposedVertex
  return h(BezierCurve, {className: "extended", points: [p1, p2]})
}

type ExtProps = {index: number}
const BezierExtensionControl = (props: ExtProps)=>{
  const {index} = props
  const {points, editMode} = useBezier()
  const point = points[index]
  const inExtendMode = editMode?.mode == "extend"
  if (inExtendMode) return null

  const isStart = index == 0;
  const isEnd = index == points.length-1
  if (!isStart && !isEnd) return null

  const polarity = isStart ? Polarity.BEFORE : Polarity.AFTER
  const angle = getAngle(point, polarity)

  return h(ExtendPlaceholder, {angle, polarity})
}

export {BezierExtensionControl, ExtendedPath}
