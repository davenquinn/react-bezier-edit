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

interface DragAction {
  data: DraggableData
}

// Discriminated union actions
interface DragBezierHandle extends DragAction, VertexAction {
  type: "drag-handle",
  polarity: Polarity
}

interface DragBezierVertex extends DragAction, VertexAction {
  type: "drag-vertex"
}

interface LayerMouseMove extends Point {
  type: "layer-move"
}

interface CanvasDrag extends DragAction {
  type: "layer-drag"
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
  | CanvasDrag

interface ProposedVertex extends BezierPoint {
  //index: number
}

interface EditableBezierCurve extends BezierCurve {
  editMode: EditMode|null,
  proposedVertex: ProposedVertex|null
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
      if (curve.editMode?.mode != "extend"
        || curve.proposedVertex?.controlPoint != null) return curve
      const vert = {
        controlPoint: null,
        x: action.x,
        y: action.y
      }
      return update(curve, {proposedVertex: {$set: vert}})
    case "layer-drag":
      if (curve.proposedVertex == null) return curve
      const controlPoint = {
        angle: 0,
        length: 100,
        length1: 100
      }
      return update(curve, {proposedVertex: {controlPoint: {$set: controlPoint}}})
  }
}

interface Size {
  width: number,
  height: number
}

interface BezierEditorProps extends BezierEditorCtx {
  initialPoints: BezierPoint[],
  children?: React.ReactChildren
}

interface BezierEditorCtx {
  canvasSize: Size
  containerRef: React.RefObject<SVGElement|null>
}

const BezierEditorContext = createContext<Partial<BezierEditorCtx>>({})

const BezierEditorProvider = (props: BezierEditorProps)=>{
  const {children, initialPoints, canvasSize, containerRef} = props
  const initialState: EditableBezierCurve = {...emptyCurve, points: initialPoints}
  const [value, dispatch] = useReducer(bezierReducer, initialState)
  return h(BezierEditorContext.Provider, {value: {canvasSize, containerRef}},
    h(BezierCurveContext.Provider, {value},
      h(BezierDispatchContext.Provider, {value: dispatch}, children)
    )
  )
}

const useBezier = ()=> useContext(BezierCurveContext)
const useDispatch = ()=> useContext(BezierDispatchContext)
const usePoints = ()=> useBezier().points
const useBezierEditor = ()=> useContext(BezierEditorContext)

export {
  BezierEditorProvider,
  useDispatch,
  useBezier,
  usePoints,
  useBezierEditor,
  Polarity
}
