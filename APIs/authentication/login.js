const response_handling = require('../common/response_handling')
const backend = require('../common/backend_json')
const jsw_helper = require('../common/jwt_helper')
const { BackendErrors, BackendErrorReasons } = require('../common/backend_errors')
const { convert_to_type, CONVERT_TYPE } = require('../common/convert_input')

function update_access_token_if_user_found(username, password) {
    // Get all users
    const user_id = backend.get_user_id(username, password)
    if (user_id == null) {
        throw new BackendErrors('Invalid username or password.', 401, null)
    }
    const session_token = jsw_helper.encode_jwt(user_id, "SECRET", 1)
    const refresh_token = jsw_helper.encode_jwt(user_id, "SECRET", Number.MAX_SAFE_INTEGER)
    
    if (backend.update_session(user_id, session_token, refresh_token) == false) {
        throw new BackendErrors('Could not update access_token for user_id ' + user_id + ' provided.', 500, null)
    }
    
    return {
        token: session_token,
        refresh_token: refresh_token
    }
}

function register_login(app) {
    app.post('/login', (request, response) => {
        try {
            const uname = convert_to_type(request.body.username, CONVERT_TYPE.string)
            const pword = convert_to_type(request.body.password, CONVERT_TYPE.string)
            if (uname == null || pword == null) {
                throw new BackendErrors('Username or password not provided', 401, BackendErrorReasons.USERNAME_PASSWORD_INVALIDr)
            }
            const tokens = update_access_token_if_user_found(uname, pword)
            response_handling.return_success_to_client(response, 200, tokens)
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        }
    });
}

module.exports = {
    register_login
}