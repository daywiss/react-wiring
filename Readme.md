# React Wiring
High performance and fine grained change subscriptions using React Hooks.

## Install
`yarn add https://github.com/daywiss/react-wiring`

## 3.0
Previous version used Providers, Contexts and useReducer, and failed attempts to optimize led me to
eventually discard them. Now wiring uses Custom change detection and `useState`. 
For high performance this library assumes you construct your state changes in a way where 
shallow comparisons are all that is needed.

## Vs useReducer and useContext
### Benefits
- No need for wrapper containers for context or to optimize component rendering 
- No need for Providers around your app
- No need for React.memo or useMemo, renders are triggerd only on data changes you subscribe to
- No need to map global state in component because you can get entire state with no penalty, 
  though mapping is available
- No penalty for wiring in many components unless they listen to many state changes
- Reduces are composable and can be nested because they are just JS Objects
- Keep component props clean, state is not mixed into component props.
- Seperate state and dispatch so dispatch does not pollute state
- Two dispatch call patterns for utility
- Store and dispatch can be used outside of React components, unlike with useReducer
- Get state once when component loads, or subscribe to state changes 
- Small footprint, 32k uncompressed
- Very minimal API to learn and no boilerplate

### Drawbacks
- Custom change detector only does shallow comparison for changed objects, 
  this should not be a problem as this is the standard way to update state in reducer

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

const {
  useWiring, //use this inside react component to get state and dispatch
  store      //use this outside react to play with state
} = Wiring(React,reducers,defaultState)


//this is the main app using the connect function.
const App = connect(props=>{
  const [state,dispatch] = useWiring('initialized')
  const {initialized} = state

  return <div>
    Initialized {initialized}
    <Button onClick={e=>dispatch('initialize',true)} />
  </div>
})


//initilize react app
const anchor = document.getElementById("app");            
ReactDOM.render(                                           
  //You do not need a provider
  <App/>,
  anchor                                                  
)
```

## Combine Reducers
Redux has a combineReducers function. You can get close to this functionality by composing your
reducer objects. This does not provide any performance
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
import users from 'user-reducer'
import wallets from 'wallet-reducer'
import Wiring from 'react-wiring'
import React from 'react'

const reducers = { 
  users,
  wallets,
}

const {useWiring,store} = default Wiring(React,reducers)

//using it in a component
export function Balance(props){
  //listen to wallet and user properties on state for changes using
  //lodash path notation.
  //the state returned is your unmapped global store state
  const [{user,wallet},dispatch] = useWiring(['wallet.balance','user.name'])

  //see how we call the reducer as lodash path notation
  //you can nest your reducer objects indefinately this way
  return <div>
    {user.name} has ${wallet.balance}
    <button onClick={e=>dispatch('wallets.setBalance',0)}>
      Clear Balance
    </button>
  </div>
}

```

## API
### React-Wiring Construction
```
  import Wiring from 'react-wiring'
  const {useWiring,store} = Wiring(React,reducers,initialState={})
```
  
#### Input
- React - pass in your React object vs 16.8 or higher (requires hooks)
- reducers - A plain object with reducer functions as values
- initialState - An object with anything in it as your starting state

#### Output
- useWiring - the use wiring hook for inside a React component
- store - the data store which allows you to get, set, dispatch and listen to state changes

### useWiring
Use wiring can only be called within a React component
```
  // in a component
  const [state,dispatch,curryDispatch] = useWiring(subscriptions,mapping)
```

#### Input
- subscription - This is how you subscribe to state changes, and can be defined in many ways:
  - `undefined` - render will happen once and no more
  - `string` - a single string to listen to one property on state, in lodash path notation.
     An empty string will subscribe you to any state changes.
  - `Array<string>` - an array of strings in lodash path notion, allows you to listen to multiple changes.
     An empty array will subscribe you to any state changes.
  - `Array<Array<string>> - an array of arrays of strings, like `[['path','a'],['path','b']]`
  - `function isEqual(prev,next)=>boolean` - a function which takes the previous state 
    and next state and returns true if no change happens or false if a change happens
    this is exactly the same as React.memo
- mapping(state)=>mappedState - This is a function which takes in state and returns a mapped state.
  It does not affect the way you subscribe, that is relative to unmapped state.

#### Output [state,dispatch,curryDispatch]
- state - Your store state
- function dispatch(action,...arguments) - a function which takes and action and arguments
  - action - a string or array of strings which represent the path to the reducer function 
  - arguments - all arguments get passed into reducer
  - example: `login(username,password).then(x=>dispatch('showSuccess','Login Complete')).catch(err=>dispatch('showError',err))
- function curryDispatch(action)=>(...arguments) - a function which returns the call for arguments
  - example: `login(username,password).then(x=>curryDispatch('showSuccess')('Login Complete')).catch(curryDispatch('showError'))




