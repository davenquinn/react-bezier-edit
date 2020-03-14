import h from 'react-hyperscript'
import {path} from 'd3-path'

const BezierComponent = (props)=>{
  const {instructions: d} = props
  const p = path()
  const p1 = [100,100]
  const p2 = [400,400]

  let c1 = [...p1]
  c1[0] += 200

  let c2 = [...p2]
  c2[0] -= 200
  c2[1] -= 50

  p.moveTo(...p1)
  p.bezierCurveTo(...c1,...c2,...p2)

  return h('path', {
    d: p.toString(),
    stroke: "#888888",
    fill: 'none',
    strokeWidth: "2px"
  })
}

export {BezierComponent}
