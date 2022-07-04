import { GET_POLY } from '../actions/poly.actions'

let initialState = {
  data: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_POLY:
      return {
        ...state,
        data: action.payload
      }
    default:
      return state
  }
}