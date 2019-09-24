import assert from 'assert'

export default ()=>{
  const listeners = []

  function remove(cb){
    const index = listeners.indexOf(cb)
    if(index) listeners.splice(index,1)
  }
  return {
    listen(cb){
      assert(cb,'requires callback')
      listeners.push(cb)
      return ()=>remove(cb)
    },
    emit(...args){
      listeners.forEach(cb=>cb(...args))
    }
  }
}
