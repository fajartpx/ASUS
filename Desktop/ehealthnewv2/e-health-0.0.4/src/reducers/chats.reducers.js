import { SET_CHATS, SET_UNSEEN_COUNT, SET_UNSEEN_DATA } from "../actions/chats.actions"

let initialState = {
  data: [],
  unseen_data: {},
  unseen_count: 0
}

export default (state = initialState, action) => {
  switch(action.type) {
    case SET_CHATS:
      return {
        ...state,
        data: action.payload
      }
    case SET_UNSEEN_DATA:
      return {
        ...state,
        unseen_data: action.payload
      }
    case SET_UNSEEN_COUNT:
      return {
        ...state,
        unseen_count: action.payload
      }
    default:
      return state
  }
}