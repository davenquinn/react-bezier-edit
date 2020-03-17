import h from '@macrostrat/hyper'
import {useReducer, useContext, createContext} from 'react'

type BezierReducer = (S: BezierCurve, A: BezierAction)=> BezierCurve
interface BezierAction {}
interface BezierEditorProps {
  initialData: BezierCurve
  children?: React.ReactChildren
}

const voidDispatch = (a: BezierAction)=> a
const BezierEditorContext = createContext<BezierCurve>([])
const BezierDispatchContext = createContext<typeof voidDispatch>(voidDispatch)

const bezierReducer: BezierReducer = (prevState, action)=>{
  return prevState
}

const BezierEditorProvider = (props: BezierEditorProps)=>{
  const {children} = props
  const [value, dispatch] = useReducer(bezierReducer, [])
  return h(BezierEditorContext.Provider, {value},
    h(BezierDispatchContext.Provider, {value: dispatch}, children)
  )
}

const useDispatch = ()=>useContext(BezierDispatchContext)

export {BezierEditorProvider, useDispatch}
