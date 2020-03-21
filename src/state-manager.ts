import h from '@macrostrat/hyper'
import {useReducer, useContext, createContext} from 'react'
import update, {Spec} from 'immutability-helper'
import {DraggableData} from 'react-draggable'
import {Polarity, getAngle, isSmooth} from './helpers'

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

interface LayerDrag extends DragAction {
  type: "layer-drag"
}

interface LayerDragStop extends DragAction {
  type: "layer-drag-stop"
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
  | LayerDrag
  | LayerDragStop

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

function createControlPoint(
    point: BezierPoint,
    control: Point,
    polarity: Polarity = Polarity.AFTER):BezierVertexControls {
  const {x, y} = control
  const dx = x-point.x
  const dy = y-point.y
  console.log(x,y,dx,dy, point.x,point.y)
  const length = Math.hypot(dx,dy)
  // Don't change angle if control arm is too short
  let angle = getAngle(point, polarity)
  if (length > 5) {
    angle = Math.atan2(dy,dx)*180/Math.PI-180
  }
  if (Array.isArray(point.controlPoint)) {
    // disconnected endpoints not handled yet
  }
  return {
    angle,
    length,
    length1: length
  }
}

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

function layerDragReducer(
    curve: EditableBezierCurve,
    action: LayerDrag|LayerDragStop): EditableBezierCurve {
  if (curve.proposedVertex == null) return curve
  const controlPoint = createControlPoint(curve.proposedVertex, action.data)
  return update(curve, {proposedVertex: {controlPoint: {$set: controlPoint}}})
}

type ArrayOperation = "$unshift" | "$push"

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
      return layerDragReducer(curve, action)
    case "layer-drag-stop": {
      const {editMode} = curve
      if (editMode?.mode != 'extend') return curve
      curve = layerDragReducer(curve, action)
      if (curve.proposedVertex == null) return curve

      let vtx = (curve.proposedVertex as BezierPoint)
      const op: ArrayOperation = editMode.polarity == Polarity.BEFORE ? "$unshift": "$push"
      let pointsSpec: Spec<BezierPoint[]> = {}

      // HACK: make sure that extending point has a control point length in both directions
      const extIx = editMode.polarity == Polarity.BEFORE ? 0 : curve.points.length-1
      const pt = curve.points[extIx];
      const len = pt.controlPoint?.length ?? pt.controlPoint?.length1 ?? 0

      pointsSpec[extIx] = {controlPoint: {length: {$set: len}, length1: {$set: len}}}

      // Forward-looking dragging is more natural
      if (vtx.controlPoint != null && isSmooth(vtx.controlPoint)) {
        vtx.controlPoint.angle = vtx.controlPoint.angle-180
      }
      pointsSpec[op] = [vtx]
      return update(curve, {
        proposedVertex: {$set: null},
        points: pointsSpec
      })
    }
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
