import {hyperStyled} from '@macrostrat/hyper'
import {DraggableEventHandler} from 'react-draggable'
import {
  BezierEditorProvider,
  useDispatch,
  useBezierEditor
} from './state-manager'
import {useRef, useEffect} from 'react'
import {Draggable} from './components/drag'
import {ExtendedPath} from './components/extend'
import {BezierCurve} from './components/curve'
import styles from './main.styl'

const h = hyperStyled(styles)

const LayerBackground = ()=>{
  const dispatch = useDispatch()
  const {containerRef, canvasSize} = useBezierEditor()

  const onMouseMove = (event: React.MouseEvent)=>{
    // Wow, this is horrible and non-performant, but it kinda-sorta works
    const {x,y} = containerRef?.current?.getBoundingClientRect() ?? {x: 0, y: 0}
    dispatch({type: "layer-move", x: event.clientX-x, y: event.clientY-y})
  }

  const onDrag: DraggableEventHandler = (event, data)=>{
    dispatch({type: "layer-drag", data})
  }

  const onStop: DraggableEventHandler = (event, data)=>{
    dispatch({type: "layer-drag-stop", data})
  }

  return h(Draggable, {onDrag, onStop},
    h("rect.layer-background", {...canvasSize, onMouseMove})
  )
}

const BezierEditComponent = ()=>{
  const initialPoints = [
    {x: 100, y: 100, controlPoint: {angle: 0, length1: 200, length: null}},
    {x: 400, y: 400, controlPoint: {length: 200, angle: 0, length1: 200}},
    {x: 500, y: 300, controlPoint: {length: 200, angle: 0, length1: null}}
  ]
  const canvasSize = {width: 1000, height: 800}

  const containerRef = useRef<SVGElement|null>()
  useEffect(()=>{
    containerRef.current = document.querySelector("svg")
  })

  const EditableBezierCurve = ()=>{
    return h(BezierCurve, [
      h(ExtendedPath)
    ])
  }


  return h(BezierEditorProvider, {initialPoints, canvasSize, containerRef}, [
    h("g.editable-bezier", [
      h(LayerBackground),
      h(EditableBezierCurve)
    ])
  ])
}

export {BezierEditComponent}
