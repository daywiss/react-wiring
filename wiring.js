import Provider from './provider'
import assert from './assert'
import Store from './store'

export default (React,reducers,state) => {
  assert(React,'requires react >=16.8')
  const {useState,useEffect,useRef} = React
  assert(useState,'requires react useState')
  assert(useEffect,'requires react useEffect')

  const store = Store(reducers,state)

  return {
    useWiring(isEqual,map=x=>x){
      const [state,setState] = useState(map(store.get()))
      useEffect(x=>store.on(isEqual,state=>setState(map(state))),[])
      return [state,store.dispatch,store.curry]
    },
    store
  }

}

