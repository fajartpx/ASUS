export const SET_CHATS = 'SET_CHATS'
export const SET_UNSEEN_DATA = 'SET_UNSEEN_DATA'
export const SET_UNSEEN_COUNT = 'SET_UNSEEN_COUNT'

export const setChats = (data) => {
  return (dispatch) => {
    dispatch({
      type: SET_CHATS,
      payload: data
    })
  }
}

export const setUnseenData = (data) => {
  return (dispatch) => {
    dispatch({
      type: SET_UNSEEN_DATA,
      payload: data
    })
  }
}

export const setUnseenCount = (data) => {
  return (dispatch) => {
    dispatch({
      type: SET_UNSEEN_COUNT,
      payload: data
    })
  }
}