import assert from './assert'
export default (React,Context) => {
  assert(React,'requires react library')
  assert(Context,'requires react context')
  return (Child,map=x=>x) => {
    return (props={})=>{
      return React.createElement(
        Context.Consumer,
        null,
        state=>React.createElement(Child,{ ...map(state), ...props, })
      )
    }
  }
}

