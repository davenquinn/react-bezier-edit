import h from '@macrostrat/hyper'
import {useReducer, useContext, createContext} from 'react'
import update, {Spec} from 'immutability-helper'
import {DraggableData} from 'react-draggable'

enum Polarity {
  BEFORE = -1,
  AFTER = 1
}

interface DragAction {
  index: number,
  data: DraggableData
}

// Discriminated union actions
interface DragBezierHandle extends DragAction {
  type: "drag-handle",
  polarity: Polarity
}

interface DragBezierVertex extends DragAction {
  type: "drag-vertex"
}

type BezierEditAction =
  | DragBezierHandle
  | DragBezierVertex

type BezierReducer = (S: BezierCurve, A: BezierEditAction)=> BezierCurve
interface BezierEditorProps {
  initialData: BezierCurve
  children?: React.ReactChildren
}

const voidDispatch = (a: BezierEditAction)=> a
const BezierCurveContext = createContext<BezierCurve>([])
const BezierDispatchContext = createContext<typeof voidDispatch>(voidDispatch)

const bezierReducer: BezierReducer = (curve, action)=>{
  const updateCurve = (spec: Spec<BezierCurve>)=>{
    return update<BezierCurve>(curve, spec)
  }
  const {x, y} = action.data
  const {index} = action

  function updateControlPoint(action: DragBezierHandle) {
    const point = curve[index]
    const dx = x-point.x
    const dy = y-point.y
    const length = Math.hypot(dx,dy)
    const angle = Math.atan2(dy,dx)*180/Math.PI-180
    if (Array.isArray(point.controlPoint)) {
      // disconnected endpoints not handled yet
    }
    let spec: Spec<BezierVertexControls> = {angle: {$set: angle}}
    if (action.polarity == 1) {
      spec['length1'] = {$set: length}
      spec['angle'] = {$set: angle+180}
    } else {
      spec['length'] = {$set: length}
    }

    return updateCurve({[index]: {controlPoint: spec}})
  }

  switch (action.type) {
    case "drag-handle":
      return updateControlPoint(action)
    case "drag-vertex":
      const spec: Spec<BezierPoint> = {x: {$set: x}, y: {$set: y}}
      return updateCurve({[index]: spec})
  }
}

const BezierEditorProvider = (props: BezierEditorProps)=>{
  const {children, initialData} = props
  const [value, dispatch] = useReducer(bezierReducer, initialData)
  return h(BezierCurveContext.Provider, {value},
    h(BezierDispatchContext.Provider, {value: dispatch}, children)
  )
}

const useDispatch = ()=> useContext(BezierDispatchContext)
const useCurve = ()=>useContext(BezierCurveContext)

export {BezierEditorProvider, useDispatch, useCurve, Polarity}
