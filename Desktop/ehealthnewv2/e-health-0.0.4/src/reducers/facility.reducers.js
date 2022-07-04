import { GET_FACILITY } from '../actions/facility.actions'

let initialState = {
  data: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_FACILITY:
      return {
        ...state,
        data: action.payload
      }
    default:
      return state
  }
}