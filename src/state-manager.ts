import h from '@macrostrat/hyper'
import {useReducer, useContext, createContext} from 'react'
import {DraggableData} from 'react-draggable'

interface DragAction {
  index: number,
  data: DraggableData
}

// Discriminated union actions
interface DragBezierHandle extends DragAction {
  type: "drag-handle"
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

const bezierReducer: BezierReducer = (prevState, action)=>{
  switch (action.type) {
    case "drag-handle":
      const {x, y} = action.data
    case "drag-vertex":
  }
  return prevState
}

const BezierEditorProvider = (props: BezierEditorProps)=>{
  const {children, initialData} = props
  const [value, dispatch] = useReducer(bezierReducer, initialData)
  return h(BezierCurveContext.Provider, {value},
    h(BezierDispatchContext.Provider, {value: dispatch}, children)
  )
}

const useDispatch = ()=>useContext(BezierDispatchContext)
const useCurve = ()=>useContext(BezierCurveContext)

export {BezierEditorProvider, useDispatch, useCurve}
