import { authHeader } from '../_helpers';
import axios from '../api';

export const userService = {
    login,
    logout,
    respondToChallenge,
    register,
    getAll,
    getById,
    update,
    delete: _delete
};

var handleResponse = (res) => {
    const data = res.data    
    if (!res.status === 200) {
        if (res.status === 401) {
            // auto logout if 401 response returned from api
            logout();
            // window.location.reload(true);
        }

        const error = (data && data.message) || res.statusText;
        return Promise.reject(error);
    }

    return data;
}

function login(username, password) {
    return axios.post(`/users/authenticate`, 
        JSON.stringify({ username, password }), {
        headers: { 'Content-Type': 'application/json' }
    })
        .then(handleResponse)
        .then(res => {
            if ('access_token' in res) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(res));
            }
            return res;
        });
}

function respondToChallenge(username, password, challenge_id, 
                            sms_code, device_token) {        
    return axios.post(`/users/authenticate/challenge`, 
        JSON.stringify({ username, password , challenge_id, 
            sms_code, device_token }), {
                headers: { 'Content-Type': 'application/json' }
            })
        .then(handleResponse)
        .then(user => {
            if ('access_token' in user) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
            }
            return user;
        });
}

function logout() {
    if (localStorage.getItem('user') === null) {
        // User not logged in, do nothing
        return;
    }

    let access_token = JSON.parse(localStorage.getItem('user'))['access_token'];
    return axios.post(`/logout`, 
        JSON.stringify({ access_token }), {
        headers: { 'Content-Type': 'application/json' }
        })
        .then(handleResponse)
        .then(user => {
            // remove user from local storage to log user out
            localStorage.removeItem('user');
    });   
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return axios(`/users`, requestOptions).then(handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return axios(`/users/${id}`, requestOptions).then(handleResponse);
}

function register(user) {
    return axios.post(`/users/register`, JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' }
    }).then(handleResponse);
}

function update(user) {
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return axios(`/users/${user.id}`, requestOptions).then(handleResponse);;
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return axios(`/users/${id}`, requestOptions).then(handleResponse);
}

