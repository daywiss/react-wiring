import assert from './assert'
import Store from './store'
import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'

export default (React,reducers,state) => {
  assert(React,'requires react >=16.8')
  const {useState,useEffect,useRef} = React
  assert(useState,'requires react useState')
  assert(useEffect,'requires react useEffect')

  const store = Store(reducers,state)

  function useWiring(isEqual,...resubscribe){
    const [state,setState] = useState(store.get())
    useEffect(x=>store.on(state=>setState(state),isEqual),resubscribe)
    return [state,store.dispatch,store.curry,store.get]
  }

  return [
    useWiring,
    store
  ]

}

