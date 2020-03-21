import h from '@macrostrat/hyper'
import {DraggableCore, DraggableCoreProps} from 'react-draggable'

const Draggable = (props: DraggableCoreProps)=>{
  return h(DraggableCore, {
    offsetParent: document.querySelector("svg"),
    ...props
  })
}

export {Draggable}
