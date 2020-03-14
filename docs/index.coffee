import {BezierComponent} from "../src"

import {PureComponent} from 'react'
import h from 'react-hyperscript'
import {render} from 'react-dom'

el = document.querySelector('#main')

SVGNamespaces = {
  xmlns: "http://www.w3.org/2000/svg"
  xmlnsXlink: "http://www.w3.org/1999/xlink"
}
SVGComponent = (props)-> h 'svg', {props..., SVGNamespaces...}

class UserInterface extends PureComponent
  render: ->
    width = 800
    h SVGComponent, {width, height: 600}, [
      h 'rect', {x: 50, y: 50, height: 500, width: width-100, fill: '#eeeeee'}
      h BezierComponent
    ]


render(h(UserInterface), el)
