import {hyperStyled} from '@macrostrat/hyper'
import {
  usePoints,
  useDispatch
} from '../state-manager'
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

type ExtProps = {index: number}
const BezierExtensionControl = (props: ExtProps)=>{
  const {index} = props
  const points = usePoints()

  const isStart = index == 0;
  const isEnd = index == points.length-1

  if (!isStart && !isEnd) return null

  const polarity = isStart ? Polarity.BEFORE : Polarity.AFTER
  const angle = getAngle(points[index], polarity)

  return h(ExtendPlaceholder, {angle, polarity})
}

export {BezierExtensionControl}
