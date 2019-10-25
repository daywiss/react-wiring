import assert from './assert'
export default (React,init,Context, events) => {
  assert(React,'requires react library')
  assert(Context,'requires react context')
  assert(events,'requires events')

  return (props) => {
    const {children,...rest} = props

    const [state,setState] = React.useState(()=>{
      events.listen(state=>{
        setState({ ...state, ...rest,  })
      })
      return {...init,...rest}
    })

    return React.createElement(Context.Provider,{value:state}, children)
  }

}
