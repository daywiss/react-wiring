import assert from './assert'
import get from 'lodash/get'
import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'

export default (reducers,state={})=>{

  const listeners = new Map()

  function dispatch(action,...args){
    const reducer = get(reducers,action)
    assert(isFunction(reducer),`No reducer for action ${action}`)
    return set( reducer(state, ...args) )
  }

  const curry = action => (...args) => dispatch(action,...args)

  function set(next){
    //swap state to be next before running callbacks
    //because they may try to get state when executing
    const prev = state
    state = next
    for (let [cb, isEqual] of listeners.entries()){
      if(!isEqual(prev,next)) cb(next)
    }
  }

  const wrapPathArray = (paths=[]) => (prev,next)=>{
    //if an empty array is passed trigger every state update
    if(paths.length == 0) return prev == next
    return  paths.every(path=>{
      return get(prev,path) == get(next,path)
    })
  }

  const wrapPathString = (path) => (prev,next)=>{
    //if empty string passed trigger every update
    if(path.length == 0) return prev == next
    return get(prev,path) == get(next,path)
  }

  function on(cb,isEqual){
    assert(isFunction(cb),'requires callback function')
    
    cb(state)

    if(isEqual){
      if(isString(isEqual)){
        listeners.set(cb,wrapPathString(isEqual))
      }
      else if(isArray(isEqual)){
        listeners.set(cb,wrapPathArray(isEqual))
      }
      else if(isFunction(isEqual)){
        listeners.set(cb,isEqual)
      }else{
        throw new Error('isEqual must be string, array of strings, array of arrays, or a function')
      }
    }

    return ()=>off(cb)
  }

  function off(cb){
    return listeners.delete(cb)
  }

  function getState(path,def){
    if(path == null) return state
    if(path.length == 0) return state
    // console.log('getting',path,state)//,path,def,get(state,path,def))
    return get(state,path,def)
  }

  return {
    dispatch,
    curry,
    on,
    off,
    get:getState,
    set,
  }
}

