# React Wiring
Wire together react components with bare-bones redux like state flow using React Contexts.

## Install
`yarn add https://github.com/daywiss/react-wiring`

## 2.0
Uses hooks and reacts reducer internally, and really just encapsulates some boilerplate at this point.
Theres still the opinionated API around reducers, you provide an object of function calls and dispatch
currys the action name and allows multiple parameters.

Dispatch is now seperate hook from state. Optional constants hook for data that does not 
change in the app. Semi-compatibility with 1.0 using the `wiring.connect` call, 
but now uses React.memo as a convenience with an optional isEqual
and mapping function. 

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

const wiring = Wiring(React,reducers,defaultState)

const {
  WiringProvider,  //Top level provider to wrap your app
  useDispatch,     //Get the dispatch call within a component
  useState,        //Get the current state within a componnet
  useConstants,    //Get your app constnats wihtin a component
  useWiring,       //Get your [state,dispatch,constants] within a component
  connect,         //Wrap your component and provide all state as props with memo
  } = wiring

//You have several ways to use the wiring, if you need state, use useWiring within
//the component. If you need to optimize rendering then use connect with an
//isEquals function.

//this is the main app using the connect function.
const App = connect(props=>{
  //"dispatch" will get passed in plus the default state
  //and constants. dispatch will always be available.
  const {dispatch,initialized,magicNumber} = props

  return <div>
    Initialized {initialized}
    <Button onClick={e=>dispatch('initialize')(true)} />
  </div>
},
//pass in optional isequal function to optimize rendering
(prev,next)=>{
  return prev.initialized == next.initialized
},
//additionally you can map your props. this will 
//only receive app state, dispatch and constants
//will be passed through regardless.
props=>{
  //optional mapping function to pass into component
  //if not specified, all props will be injected
  return {
    initialied:props.initialized
  }
})

//initilize react app
const anchor = document.getElementById("app");            
ReactDOM.render(                                           
  //you can provide props in the provider. 
  //These will become the constants in useConstants.
  <Provider magicNumber={42}>                                    
    <App/>                                                 
  </Provider>,                                             
  anchor                                                  
)
```
