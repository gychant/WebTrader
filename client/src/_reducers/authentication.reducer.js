import { userConstants } from '../_constants';

let user = JSON.parse(localStorage.getItem('user'));
const initialState = user ? { 
  loggedIn: false, 
  user
} : {};

export function authentication(state = initialState, action) {
  switch (action.type) {
    case userConstants.LOGIN_REQUEST:
      return {
        loggingIn: true,
        user: action.user
      };
    case userConstants.LOGIN_SUCCESS:
      return {
        loggedIn: true,
        user: action.user
      };
    case userConstants.LOGIN_VERIFICATION:
      return {
        loggedIn: false,
        loggingIn: true,
        challenge_id: action.challenge.id,
        device_token: action.challenge.device_token
      };
    case userConstants.LOGIN_FAILURE:
      return {
        loggedIn: false,
        error: action.error
      };
    case userConstants.LOGOUT:
      return {
        loggedIn: false
      };
    default:
      return state
  }
}