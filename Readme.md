# React Wiring
Wire together react components with bare-bones redux like state flow using React Contexts.

## Install
`yarn add https://github.com/daywiss/react-wiring`

## Usage

```js
import React from 'react'
import Wiring from 'react-wiring'

//default state you want your component props to see
const defaultState = {
  initialized:false
}

//design your state reducers
const reducers = {
  initialize(state,initialized){
    return {
      ...state,
      initialized
    }
  }
}

const wiring = Wiring(React,defaultState,reducers)

let {Provider,dispatch,connect} = wiring

//this is the main app. 
const App = connect(props=>{
  //"dispatch" will get passed in plus the default state
  //dispatch will always be available.
  const {dispatch,initialized} = props

  return <div>
    Initialized {initialized}
    <Button onClick={e=>dispatch('initialize')(true)} />
  </div>
},props=>{
  //optional mapping function to pass into component
  //if not specified, all props will be injected
  return {
    initialied:props.initialized
    //props.magicNumber is omitted but available
  }
})

//initilize react app
const anchor = document.getElementById("app");            
ReactDOM.render(                                           
//you can provide props in the provider, and these will always be accessible
//from child components unless the optional map omits it
  <Provider magicNumber={42}>                                    
    <App/>                                                 
  </Provider>,                                             
  anchor                                                  
)
```
