import { KOMA_API_URL, KOMA_API_TOKEN_KEY } from '../tools/constants'

export const GET_FACILITY = 'GET_FACILITY'

export const getFacility = () => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}facility`, {
        method: 'GET',
        headers: {
          'Token-Key': KOMA_API_TOKEN_KEY
        }
      })
        .then(res => res.json())
        .then(res => {
          resolve(res)
          if(res.status) {
            dispatch({
              type: GET_FACILITY,
              payload: res.data
            })
          }
        })
        .catch(reject)
    })
  }
}