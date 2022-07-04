import { KOMA_API_URL, KOMA_API_TOKEN_KEY } from '../tools/constants'

export const GET_DOCTORS = 'GET_DOCTORS'
export const GET_DOCTOR_DETAILS = 'GET_DOCTOR_DETAILS'

export const getDoctors = (attr = {}, reset = false) => {
  return (dispatch) => {
    dispatch({
      type: GET_DOCTORS,
      payload: {
        status: 'FETCHING',
        reset
      }
    })

    if(reset) attr = {...attr, page: 1}

    const body = new FormData()
    body.append('page', attr.page || 1)
    if(attr.limit) body.append('limit', attr.limit)
    if(attr.faskes_id) body.append('faskes_id', attr.faskes_id)
    if(attr.poly_id) body.append('poly_id', attr.poly_id)
    if(attr.specialist_id) body.append('specialist_id', attr.specialist_id)
    if(attr.user_doctor_chat) body.append('user_doctor_chat', attr.user_doctor_chat)
    if(attr.user_name) body.append('user_name', attr.user_name)
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}doctor`, {
        method: 'POST',
        headers: {
          'Token-Key': KOMA_API_TOKEN_KEY
        },
        body
      })
        .then(res => res.json())
        .then(res => {
          resolve(res)
          if(res.status) {
            dispatch({
              type: GET_DOCTORS,
              payload: {
                data: res.data,
                current_page: res.current_page,
                max_length: res.max_length,
                max_page: res.max_page,
                reset: reset,
                status: res.max_page > res.current_page ? 'READY' : 'REACHED'
              }
            })
          } else {
            dispatch({
              type: GET_DOCTORS,
              payload: {
                status: 'ERROR'
              }
            })
          }
        })
        .catch(e => {
          reject(e)
          dispatch({
            type: GET_DOCTORS,
            payload: {
              status: 'ERROR'
            }
          })
        })
    })
  }
}

export const getDoctorDetails = (id) => {
  return (dispatch) => {
    dispatch({
      type: GET_DOCTOR_DETAILS,
      payload: {
        status: 'FETCHING'
      }
    })
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}doctor/details/${id}`, {
        method: 'POST',
        headers: {
          'Token-Key': KOMA_API_TOKEN_KEY
        }
      })
        .then(res => res.json())
        .then(res => {
          resolve(res)
          if(res.status) {
            dispatch({
              type: GET_DOCTOR_DETAILS,
              payload: {
                data: res.data,
                status: 'READY'
              }
            })
          } else {
            dispatch({
              type: GET_DOCTOR_DETAILS,
              payload: {
                status: 'ERROR'
              }
            })
          }
        })
        .catch(e => {
          reject(e)
          dispatch({
            type: GET_DOCTOR_DETAILS,
            payload: {
              status: 'ERROR'
            }
          })
        })
    })
  }
}