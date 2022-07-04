import { applyMiddleware, createStore } from 'redux'
import rootReducer from './reducers'
import logger from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

export default () => {
  return createStore(
    rootReducer,
    applyMiddleware(logger, thunkMiddleware)
  )
}