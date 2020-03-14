import {Component} from 'react'
import h from 'react-hyperscript'
import {path} from 'd3-path'

class BezierComponent extends Component
  render: ->
    {instructions: d} = @props
    p = path()
    p1 = [100,100]
    p2 = [400,400]

    c1 = [p1...]
    c1[0] += 200

    c2 = [p2...]
    c2[0] -= 200

    p.moveTo p1...
    p.bezierCurveTo c1...,c2...,p2...

    h 'path', {
      d: p.toString(),
      stroke: "#888888",
      fill: 'none'
      strokeWidth: "2px"
    }

export {BezierComponent}
