import { GET_DOCTORS, GET_DOCTOR_DETAILS } from '../actions/doctors.actions'

let initialState = {
  all: {
    data: [],
    next_page: 1,
    current_page: 0,
    max_page: 0,
    max_length: 0,
    status: ''
  },
  picked: {
    data: null,
    status: ''
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_DOCTORS:
      switch(action.payload.status) {
        case 'ERROR':
          return {
            ...state,
            all: {
              ...state.all,
              status: action.payload.status
            }
          }
        case 'REACHED':
          return {
            ...state,
            all: {
              ...state.all,
              data: [...state.all.data, ...action.payload.data],
              status: action.payload.status
            }
          }
        case 'FETCHING':
          if(action.payload.reset) return initialState
          return {
            ...state,
            all: {
              ...state.all,
              status: action.payload.status
            }
          }
        default:
          return {
            ...state,
            all: {
              ...state.all,
              data: action.payload.reset ? action.payload.data : [...state.all.data, ...action.payload.data],
              next_page: action.payload.reset ? 2 : state.all.next_page + 1,
              current_page: action.payload.current_page,
              max_page: action.payload.max_page,
              max_length: action.payload.max_length,
              status: action.payload.status
            }
          }
      }
    case GET_DOCTOR_DETAILS:
      return {
        ...state,
        picked: {
          ...state.picked,
          data: (action.payload.status) !== 'ERROR' && action.payload.data || state.picked,
          status: action.payload.status
        }
      }
    default:
      return state
  }
}