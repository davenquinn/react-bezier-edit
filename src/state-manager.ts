import h from '@macrostrat/hyper'
import {useReducer, useContext, createContext} from 'react'
import update, {Spec} from 'immutability-helper'
import {DraggableData} from 'react-draggable'
import {Polarity, getAngle} from './helpers'

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

function updateControlPoint(curve: BezierCurve, action: DragBezierHandle) {
  const {x, y} = action.data
  const {index} = action
  const point = curve[index]
  const dx = x-point.x
  const dy = y-point.y
  const length = Math.hypot(dx,dy)
  // Don't change angle if control arm is too short
  let angle = getAngle(point, action.polarity)
  if (length > 5) {
    angle = Math.atan2(dy,dx)*180/Math.PI-180
  }
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

  return update(curve, {[index]: {controlPoint: spec}})
}

const bezierReducer: BezierReducer = (curve, action)=>{
  switch (action.type) {
    case "drag-handle":
      return updateControlPoint(curve, action)
    case "drag-vertex":
      const {x, y} = action.data
      const {index} = action
      return update(curve, {[index]: {x: {$set: x}, y: {$set: y}}})
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
