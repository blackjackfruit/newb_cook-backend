const BackendErrors                     = require('../common/backend_errors')
const response_handling                 = require('../common/response_handling')
const { is_token_valid }                = require('../common/jwt_helper')
const backend                           = require('../common/backend_json')
const { get_access_token }              = require('../common/jwt_helper')
const { CONVERT_TYPE, convert_to_type } = require('../common/convert_input')
const SECRET = 'SECRET'

function register_return_remaining_lists_after_removal_of_list_name(app) {
    app.post("/return_remaining_lists_after_removal_of_list_name", (request, response) => {
        try {
            const token     = convert_to_type(get_access_token(request.headers.authorization), CONVERT_TYPE.string)
            const list_name = convert_to_type(request.body.list_name, CONVERT_TYPE.string)
            if (token == null || list_name == null) {
                throw new BackendErrors("Missing required fields.", 400, null)
            }
            is_token_valid(token, SECRET)
            const user_id = backend.get_user_id_from_token(token)
            if (user_id == null) {
                throw new BackendErrors("Could not find user_id for token " + token + " provided.", 400, null)
            }
            backend.remove_list_name(user_id, list_name)
            const list_names = backend.retrieve_list_names(user_id)
            response_handling.return_success_to_client(response, 200, list_names)
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        }
        
    });
}

module.exports = {
    register_return_remaining_lists_after_removal_of_list_name
}