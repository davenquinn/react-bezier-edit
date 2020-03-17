import {BezierEditComponent} from "../src"
import h from 'react-hyperscript'
import {render} from 'react-dom'

const el = document.querySelector('#main')

const SVGNamespaces = {
  xmlns: "http://www.w3.org/2000/svg",
  xmlnsXlink: "http://www.w3.org/1999/xlink"
}
const SVGComponent = (props)=> h('svg', {...props, ...SVGNamespaces})

const UserInterface = (props)=>{
  const width = 1000
  const height = 800
  return h(SVGComponent, {width, height}, [
    h('rect', {x: 50, y: 50, height: height-100, width: width-100, fill: '#eeeeee'}),
    h(BezierEditComponent)
  ])
}

render(h(UserInterface), el)
