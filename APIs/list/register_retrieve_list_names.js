const response_handling                     = require('../common/response_handling')
const backend                               = require('../common/backend_json')
const { is_token_valid, get_access_token, get_jwt_payload_from_token }  = require('../common/jwt_helper')
const { CONVERT_TYPE, convert_to_type }     = require('../common/convert_input')
const { BackendErrors, BackendErrorReasons }= require('../common/backend_errors')
const SECRET = 'SECRET'

function register_retrieve_list_names(app) {
    app.get("/retrieve_list_names", (request, response) => {
        
        try {
            const token = convert_to_type(get_access_token(request.headers.authorization), CONVERT_TYPE.string)
            if (token == null) {
                throw new BackendErrors("No token provided", 400, BackendErrorReasons.INVALID_TOKEN)
            }
            // Discard result due to checking to see if payload can be extracted, or throw error
            var payload = get_jwt_payload_from_token(token, SECRET)
            is_token_valid(token, SECRET)
            const user_id = backend.get_user_id_from_token(token);
            if (user_id == null) {
                throw new BackendErrors("Could not find user_id for token " + token + " provided.", 400, BackendErrorReasons.INVALID_USER_ID)
            }
            const list_names_with_ids = backend.get_list_names_from_user_id(user_id);
            response_handling.return_success_to_client(response, 200, list_names_with_ids);
        } catch (error) {
            response_handling.return_failure_to_client(response, error);
        }
    });
}

module.exports = {
    register_retrieve_list_names
}