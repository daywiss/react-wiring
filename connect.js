import assert from './assert'
export default (React,contexts) => {
  assert(React,'requires react library')
  assert(Context,'requires react context')
  return (Child,map=x=>x) => {
    return (props={})=>{
      return React.createElement( contexts.constants.Consumer, null,
        React.createElement(contexts.dispatch.Consumer,null,
          React.createElement(contexts.state.Consumer,null,
          )
        )
        state=>React.createElement(Child,{ dispatch, ...map(state), ...props, })
      )
    }
    }
  }
  // return (Child,map=x=>x) => {
  //   return (props={})=>{
  //     return React.createElement(
  //       Context.Consumer,
  //       null,
  //       state=>React.createElement(Child,{ dispatch, ...map(state), ...props, })
  //     )
  //   }
  // }
}

