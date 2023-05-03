const response_handling = require('../common/response_handling')
const backend = require('../common/backend_json')
const { BackendErrors, BackendErrorReasons } = require('../common/backend_errors')
const { get_jwt_payload_from_token, encode_jwt, is_token_expired, get_access_token } = require('../common/jwt_helper')
const { convert_to_type, CONVERT_TYPE } = require('../common/convert_input')
const SECRET = 'SECRET'

function register_jwt_life_cycle_maintainer(app) {
    app.post('/jwt_life_cycle_maintainer_get_new_token', (request, response) => {
        try {
            const refresh_access_token = convert_to_type(get_access_token(request.headers.authorization), CONVERT_TYPE.string)
            if (refresh_access_token == null) {
                throw new BackendErrors('Missing required fields.', 400, null)
            }
            if (backend.is_refresh_token_valid(refresh_access_token) == false) {
                throw new BackendErrors('Invalid refresh token.', 401, BackendErrorReasons.INVALID_REFRESH_TOKEN)
            }

            const json_payload = get_jwt_payload_from_token(refresh_access_token, SECRET)
            if (json_payload == null) {
                throw new BackendErrors('Invalid refresh token.', 400, null)
            }
            const user_id = json_payload.user_id
            const expiration_date = json_payload.exp
            if (user_id == null || expiration_date == null) {
                throw new BackendErrors('Invalid refresh token.', 400, null)
            }

            if (backend.is_user_id_valid(user_id) == false) {
                throw new BackendErrors('Invalid user_id.', 401, null)
            }

            const new_access_token = encode_jwt(user_id, SECRET, 1)
            const new_refresh_token = encode_jwt(user_id, SECRET, 24)
            backend.temp_save_session(
                refresh_access_token,
                new_access_token,
                new_refresh_token
            )
            response_handling.return_success_to_client(response, 200, {
                "token": new_access_token,
                "refresh_token": new_refresh_token
            })
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        }
    })
    app.patch('/jwt_life_cycle_maintainer_save_new_token', (request, response) => {
        try {
            const token = convert_to_type(get_access_token(request.headers.authorization), CONVERT_TYPE.string)
            if (token == null) {
                throw new BackendErrors('Missing required fields', 400, null)
            }
            const payload = get_jwt_payload_from_token(token, SECRET)
            if (backend.is_user_id_valid(payload.user_id) == false) {
                throw new BackendErrors('Invalid user_id', 400, null)
            }
            backend.update_session_to_permanent_status(token)
            response_handling.return_success_to_client(response, 200, {})
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        }
    })
    app.head('/jwt_life_cycle_maintainer_status', (request, response) => {
        let token = request.headers.authorization
        try {
            const token = convert_to_type(get_access_token(request.headers.authorization), CONVERT_TYPE.string)
            if (token == null) {
                throw new BackendErrors('Missing required fields', 400, null)
            }
            const json_payload = get_jwt_payload_from_token(token, SECRET)
            if (json_payload == null) {
                throw new BackendErrors('Invalid token', 400, null)
            }
            const user_id = json_payload.user_id
            const expiration_date = json_payload.exp
            if (user_id == null || expiration_date == null) {
                throw new BackendErrors('Invalid refresh token.', 400, null)
            }
            if (backend.is_user_id_valid(user_id) == false) {
                throw new BackendErrors('Invalid user_id', 401, null)
            }
            const access_token_is_not_valid = is_token_expired(token, SECRET)
            if (access_token_is_not_valid) {
                throw new BackendErrors('Invalid token', 401, null)
            }
            response_handling.return_success_to_client(response, 200, {}) 
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        } 
    })
}

module.exports = {
    register_jwt_life_cycle_maintainer
}