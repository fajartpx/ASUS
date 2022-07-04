import chats from './chats.reducers'
import facility from './facility.reducers'
import poly from './poly.reducers'
import doctors from './doctors.reducers'
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
  chats,
  facility,
  poly,
  doctors
})

export default rootReducer