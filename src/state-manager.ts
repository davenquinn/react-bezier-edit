import h from '@macrostrat/hyper'
import {useReducer, useContext, createContext} from 'react'
import update, {Spec} from 'immutability-helper'
import {DraggableData} from 'react-draggable'
import {Polarity, getAngle} from './helpers'

interface ExtendModeData {
  mode: 'extend',
  polarity: Polarity
}

type EditMode =
  | ExtendModeData

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

interface LayerMouseMove extends Point {
  type: 'layer-move'
}

interface EnterExtendMode {
  type: 'enter-extend-mode',
  polarity: Polarity
}

type BezierEditAction =
  | DragBezierHandle
  | DragBezierVertex
  | EnterExtendMode
  | LayerMouseMove

interface EditableBezierCurve extends BezierCurve {
  editMode: EditMode|null,
  proposedVertex: BezierPoint|null
}

type BezierReducer = (S: EditableBezierCurve, A: BezierEditAction)=> EditableBezierCurve

const emptyCurve: EditableBezierCurve = {
  points: [],
  editMode: null,
  proposedVertex: null
}

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
      return update(curve, {points: {[index]: {x: {$set: x}, y: {$set: y}}}})
    case 'enter-extend-mode':
      const {polarity} = action
      return update(curve, {editMode: {$set: {mode: 'extend', polarity}}})
    case 'layer-move':
      if (curve.editMode?.mode != "extend") return curve
      const vert = {
        controlPoint: null,
        x: action.x,
        y: action.y
      }
      return update(curve, {proposedVertex: {$set: vert}})
  }
}

interface BezierEditorProps {
  initialPoints: BezierPoint[],
  children?: React.ReactChildren
}

const BezierEditorProvider = (props: BezierEditorProps)=>{
  const {children, initialPoints} = props
  const initialState: EditableBezierCurve = {...emptyCurve, points: initialPoints}
  const [value, dispatch] = useReducer(bezierReducer, initialState)
  return h(BezierCurveContext.Provider, {value},
    h(BezierDispatchContext.Provider, {value: dispatch}, children)
  )
}

const useDispatch = ()=> useContext(BezierDispatchContext)
const usePoints = ()=>useContext(BezierCurveContext).points

export {BezierEditorProvider, useDispatch, usePoints, Polarity}
