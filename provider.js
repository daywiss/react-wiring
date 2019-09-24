import assert from './assert'
export default (React,init,dispatch,Context, events) => {
  assert(React,'requires react library')
  assert(Context,'requires react context')
  assert(events,'requires events')

  return (props) => {
    const {children,...rest} = props

    const [state,setState] = React.useState(()=>{
      events.listen(state=>{
        setState({ ...state, ...rest, dispatch, })
      })
      return {...init,...rest,dispatch}
    })

    return React.createElement(Context.Provider,{value:state}, children)
  }

}
