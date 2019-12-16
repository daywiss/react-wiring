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
    Magic Number {magicNumber}
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

//this uses the build in hooks, but you cannot
//use memoization easily.
const AppUsingHooks = props=>{
  const dispatch = useDispatch()
  const state = useState()
  const constants = useConstants()

  //this is equivalent
  //const [state,dispatch,constants] = useWiring()

  return <div>
    Initialized {state.initialized}
    Magic Number {constants.magicNumber}
    <Button onClick={e=>dispatch('initialize')(true)} />
  </div>
}

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

## Combine Reducers
Redux has a combineReducers function. You can get close to this functionality by merging your
reducer objects as long as keys do not collide. This does not provide any performance
improvents and is just organizational.


```
//user-reducer.js
export default {
  updateUserName(state,name){
    return {
      ...state,
      'user':{...state.user,name}
    }
  }
}
```

```
//wallet-reducer.js
export default {
  setBalance(state,balance){
    return {
      ...state,
      'wallet':{...state.wallet,balance}
    }
  }
}
```

```
//combine-reducers.js
import user from 'user-reducer'
import wallet from 'wallet-reducer'
import Wiring from 'react-wiring'
import React from 'react'

const reducers = { 
  ...user,
  ..wallet
}

export default Wiring(React,reducers)

```

