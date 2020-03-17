import h from '@macrostrat/hyper'
import {useReducer, useContext, createContext} from 'react'
import update, {Spec} from 'immutability-helper'
import {DraggableData} from 'react-draggable'
import {Polarity, getAngle} from './helpers'

interface ExtendModeData {
  type: EditMode.EXTEND,
  polarity: Polarity
}

interface VertexAction {
  index: number
}

interface DragAction extends VertexAction {
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

type BezierReducer = (S: EditableBezierCurve, A: BezierEditAction)=> EditableBezierCurve

const emptyCurve: EditableBezierCurve = {points: [], editMode: null}
const voidDispatch = (a: BezierEditAction)=> a
const BezierCurveContext = createContext<EditableBezierCurve>(emptyCurve)
const BezierDispatchContext = createContext<typeof voidDispatch>(voidDispatch)

function updateControlPoint(curve: EditableBezierCurve, action: DragBezierHandle) {
  const {x, y} = action.data
  const {index} = action
  const point = curve.points[index]
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

  return update(curve, {points: {[index]: {controlPoint: spec}}})
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

interface BezierEditorProps {
  initialPoints: BezierPoint[],
  children?: React.ReactChildren
}

const BezierEditorProvider = (props: BezierEditorProps)=>{
  const {children, initialPoints} = props
  const initialState: EditableBezierCurve = {points: initialPoints, editMode: null}
  const [value, dispatch] = useReducer(bezierReducer, initialState)
  return h(BezierCurveContext.Provider, {value},
    h(BezierDispatchContext.Provider, {value: dispatch}, children)
  )
}

const useDispatch = ()=> useContext(BezierDispatchContext)
const usePoints = ()=>useContext(BezierCurveContext).points

export {BezierEditorProvider, useDispatch, usePoints, Polarity}
