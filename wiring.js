import Provider from './provider'
import assert from './assert'

export default (React,reducers={},state={}) => {
  assert(React,'requires react library')

  const contexts = {
    dispatch:React.createContext(),
    state:React.createContext(),
    constants:React.createContext(),
  }

  const provider = Provider(React,contexts,reducers,state)

  const Use = (name,Context) => () =>{
    const context = React.useContext(Context)
    if (context === undefined) {
      throw new Error(`use${name} must be used within a ReactWiring Provider`)
    }
    return context
  }

  const useState = Use('State',contexts.state)
  const useDispatch = Use('Dispatch',contexts.dispatch)
  const useConstants = Use('Constants',contexts.constants)

  const useWiring = ()=>{
    return [
      useState(),
      useDispatch(),
      useConstants(),
    ]
  }

  return {
    WiringProvider:provider,
    useWiring,
    useState,
    useDispatch,
    useConstants,
    connect(Child,isEqual,map=x=>x){
      const memo = React.memo(Child,isEqual)
      return props=>{
        const [state,dispatch,constants] = useWiring()
        return React.createElement(memo,{dispatch,...constants,...map(state),...props})
      }
    }
  }

}

