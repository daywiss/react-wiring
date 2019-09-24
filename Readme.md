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
  const {dispatch,initialized} = props

  return <div>
    Initialized {initialized}
    <Button onClick={e=>dispatch('initialize')(true)} />
  </div>
})

//initilize react app
const anchor = document.getElementById("app");            
ReactDOM.render(                                           
  <Provider>                                    
    <App/>                                                 
  </Provider>,                                             
  anchor                                                  
)
```
