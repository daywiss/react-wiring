import get from 'lodash.get'
import isArray from 'lodash.isarray'
import isFunction from 'lodash.isfunction'
import isString from 'lodash.isstring'
import assert from './assert'

export default (reducers,state={})=>{

  const listeners = new Map()

  function dispatch(action,...args){
    const reducer = get(reducers,action)
    assert(isFunction(reducer),`No reducer for action ${action}`)
    return set( reducer(state, ...args) )
  }

  const curry = action => (...args) => dispatch(action,...args)

  function set(next){
    for (let [cb, isEqual] of listeners.entries()){
      if(!isEqual(state,next)) cb(next)
    }
    state = next
  }

  const wrapPathArray = (paths=[]) => (prev,next)=>{
    //if an empty array is passed trigger every state update
    if(paths.length == 0) return false
    return  paths.every(path=>{
      return get(prev,path) == get(next,path)
    })
  }

  const wrapPathString = (path) => (prev,next)=>{
    //if empty string passed trigger every update
    if(path.length == 0) return false
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

  function getState(){
    return state
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

