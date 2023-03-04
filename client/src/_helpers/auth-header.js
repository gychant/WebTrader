export function authHeader() {
    // return authorization header with access token
    let user = JSON.parse(localStorage.getItem('user'));
    
    if (user && user.access_token) {
        return user.access_token;
    } else {
        return null;
    }
}