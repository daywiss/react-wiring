import assert from './assert'

export default (state={}, handlers,emit=x=>x) => type => (...args) => {
  assert(handlers[type],'No handler for type: ' + type)
  state = handlers[type](state,...args)
  emit(state)
  return state
}


