# React Wiring
High performance and fine grained change subscriptions using React Hooks.

## Install
`yarn add https://github.com/daywiss/react-wiring`

## v3.0
Previous version used Providers, Contexts and useReducer, and failed attempts to optimize led me to
eventually discard them. Now wiring uses Custom change detection and `useState`. 
For high performance this library assumes you construct your state changes in a way where 
shallow comparisons are all that is needed.

## Benefits
- No need for wrapper containers for context or to optimize component rendering 
- No need for Providers around your app
- No need for React.memo or useMemo, renders are triggerd only on data changes you subscribe to
- No need to map global state in component because you can get entire state with no penalty.
- No penalty for wiring in many components unless they listen to many state changes, and even then its low
- Split up your state naturally with multiple react-wiring instances
- Reducers are composable and can be nested because they are just JS Objects
- Keep component props clean, state is not mixed into component props.
- Seperate state and dispatch so dispatch does not pollute state
- Two dispatch call patterns for utility
- Store and dispatch can be used outside of React components, unlike with useReducer
- Get state once when component loads, or subscribe to state changes 
- Small footprint, 32k uncompressed
- Very minimal API to learn and no boilerplate

## Drawbacks
- Custom change detector only does shallow comparison for changed objects, 
  this should not be a problem as this is the standard way to update state in reducer
- Maintains reference to current state in store, which means you cannot modify state directly in reducer
  or changes will not be detected.
- There is no guard against mutating state outside of the store so you have to be very careful.
- Modifying deeply nested state can be tricky, as it may mutate store state if not done right. Its recommended 
  to use a helper function which will touch the object along the entire path.
  
## Quick Start

```js
import React from 'react'
import Wiring from 'react-wiring'

//default state you want your component props to see
const initialState = {
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

const [
  useWiring, //use this inside react component to get state and dispatch
  store      //use this outside react to play with state
] = Wiring(React,reducers,initialState)


//this is the main app using the connect function.
const App = props=>{
  //you want to listen to the 'initialized' property on state
  //it is optional to listen for changes, if omitted you will just get latest state
  const [state,dispatch] = useWiring('initialized')
  const {initialized} = state

  return <div>
    Initialized? {initialized.toString()}
    <Button onClick={e=>dispatch('initialize',true)} />
  </div>
}


//initilize react app
const anchor = document.getElementById("app");            
ReactDOM.render(                                           
  //You do not need a provider
  <App/>,
  anchor                                                  
)
```

## API
### Construction
```js
  import Wiring from 'react-wiring'
  const [useWiring,store] = Wiring(React,reducers,initialState={})
```
  
#### Input(React,reducers,initialState={})
- **React** - pass in your React object v16.8 or higher (requires hooks)
- **reducers** - A plain object with reducer functions as values
- **reducer(state,...dispatchArguments)=>state** - A named callback function with current state passed in and any 
  user provided arguments.
  - **state** - the current state in the store ( do not modify in reducer)
  - **...dispatchArguments** - parameters passed in from dispatch call, can be anything 
  - **=> state** - the new state after reducer runs
    ```js
    const reducers = {
      setBalance(state,amount){
        return {
          ...state,
          balance:{
            ...state.balance,
            amount
          }
        }
      },
      addBalance(state,add){
        return {
          ...state,
          balance:{
            ...state.balance,
            amount:state.balance.amount + add
          }
        }
      }
    }
    ```

- **initialState** - An object with anything in it as your starting state

#### Output => [useWiring,store]
- **useWiring** - the use wiring hook for inside a React component
- **store** - the data store which allows you to get, set, dispatch and listen to state changes outside of React

### useWiring
Use wiring can only be called within a React component
```js
  // in a component
  const [state,dispatch,curryDispatch,get] = useWiring(subscriptions,...resubscribe)

  //if you only need certain return values, this is valid
  const [,,curry,get] = useWiring(subscriptions,...resubscribe)
```

#### Input useWiring(subscriptions,...resubscribe)
- **subscriptions** - This is how you subscribe to state changes, and can be defined in many ways:
  - `undefined` - render will happen once and no more
  - `string` - a single string to listen to one property on state, in lodash path notation.
     An empty string will subscribe you to any state changes.
  - `Array<string>` - an array of strings in lodash path notion, allows you to listen to multiple changes.
     An empty array will subscribe you to any state changes.
  - `Array<Array<string>>` - an array of arrays of strings, like `[['path','a'],['path','b']]`
  - `function isEqual(prev,next)=>boolean` - a function which takes the previous state 
    and next state and returns true if no change happens or false if a change happens
    this is exactly the same as React.memo
- **resubscribe** - Optional arguments for data that lives outside of the store which may require a new subscription on change.
   For the most part you only need this if you have variables in your path subscriptions that are dynamic.

#### Output => [state,dispatch,curryDispatch,get]
Outputs an array of parameters that should be destructured.

- **state** - Your store state
- **function dispatch(action,...arguments)** - a function which takes and action and arguments
  - **action** - a string or array of strings which represent the path to the reducer function 
  - **arguments** - all arguments get passed into reducer
  - example: `login(username,password).then(x=>dispatch('showSuccess','Login Complete')).catch(err=>dispatch('showError',err))`
- **function curryDispatch(action)=>(...arguments)** - a function which returns the call for arguments
  - example: `login(username,password).then(x=>curryDispatch('showSuccess')('Login Complete')).catch(curryDispatch('showError'))`
- **function get(path,defaults)** - a function which will allow lodash notation 
    to get properties inside the state and avoid runtime errors.
  - **path** - a string or array in lodash path notation. If not specified will return entire state.
  - **defaults** - an optional parameter to return if the data is undefined at that path

### Store
```js
The store allows you to listen to state change and mutate state outside of React.
  const [_,store] = Wiring(React,reducer)
  const {dispatch,curry,set,get,on,off} = store
```
#### Properties
- **store.dispatch(action,...arguments)** - Call a reducer and specify arguments
  - **action** - a string or array of strings which represent the path to the reducer function 
  - **arguments** - all arguments get passed into reducer
- **store.curry(action)(...arguments)** - Call a reducer in a curried way.
  - **action** - a string or array of strings which represent the path to the reducer function 
  - **arguments** - all arguments get passed into reducer
- **store.get(path,defaults)** - return current state or partial state based on path in lodash path notation.
  - **path** - a string or array in lodash path notation. If not specified will return entire state.
  - **defaults** - an optional parameter to return if the data is undefined at that path
- **store.set(state)** - set state and trigger all listeners. Anything passed in here replaces the state.
- **store.on(callback,subscriptions)=>off** - subscribe to state changes
  - **callback(state)** - callback expects a single input which is the store state
  - **subscriptions** - optional field to subscribe to key changes on state, defined above in useWiring
  - **=> off()** - return unsubscribe function
- **store.off(callback)** - unsubscribe by passing callback function subscription in

## Guide

### Combine Reducers
Redux has a combineReducers function. You can get close to this functionality by composing your
reducer objects. This does not provide any performance
improvents and is just organizational. 


```js
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

```js
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

```js
//combine-reducers.js
import users from './user-reducer'
import wallets from './wallet-reducer'
import Wiring from 'react-wiring'
import React from 'react'

export default const reducers = { 
  users,
  wallets,
}
```

```js
//wiring.js
import reducers from './combine-reducers'

export default const [useWiring,store] = Wiring(React,reducers)
```

```js
import {useWiring} from './wiring'

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

### Add Reducers at Runtime
Because the reducer is a javascript object we can just attach new keys at any point.

```js

const reducers = { 
  users,
  wallets,
}

const [useWiring,store] = Wiring(React,reducers)

//This could be added at any point, lets say if user was authenticated
reducers.admin = {
  makeAdmin(state,isAdmin=true){
    return {
      ...state,
      user:{...state.user,isAdmin}
    }
  }
}

//dispatch can now call
store.dispatch('admin.makeAdmin',true/false)

```



