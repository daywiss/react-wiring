import assert from './assert'
export default (React,contexts, handlers,defaultState={}) => {
  assert(React,'requires react library')
  assert(handlers,'requires handlers')
  assert(contexts,'requires contexts')

  return ({children,...props}) => {

    const [state,dispatch] = React.useReducer((state,{action,args=[]})=>{
      assert(handlers[action],'No handler for action: ' + action)
      return handlers[action](state,...args)
    },defaultState)

    const wrap = React.useRef(action => (...args) => {
      return dispatch({action,args})
    }).current

    const constants = React.useRef(props).current

    return React.createElement(contexts.state.Provider,{value:state},
      React.createElement(contexts.constants.Provider,{value:constants},
       React.createElement(contexts.dispatch.Provider,{value:wrap},
          children
        )
      )
    )
  }

}
