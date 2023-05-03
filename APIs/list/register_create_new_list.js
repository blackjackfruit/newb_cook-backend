const response_handling = require('../common/response_handling')
const backend = require('../common/backend_json')
const { BackendErrors } = require('../common/backend_errors')
const { convert_to_type, CONVERT_TYPE } = require('../common/convert_input')
const { get_access_token } = require('../common/jwt_helper')

// This function will create a new list for the user and return the list_id
// and list_name to the user.
function register_create_new_list(app) {
    app.post('/create_new_list', (request, response) => {
        const list_name = request.body.list_name
        
        try {
            const token = convert_to_type(get_access_token(request.headers.authorization), CONVERT_TYPE.string)
            const user_id = backend.get_user_id_from_token(token)
            if (user_id == null) {
                throw new BackendErrors('Could not find user_id for token ' + token + ' provided', 400, null)
            }
            const list_id = backend.create_new_list_name(user_id, list_name)
            response_handling.return_success_to_client(response, 200, {
                "list_id": list_id,
                "list_name": list_name
            })
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        }
    })
}

module.exports = {
    register_create_new_list
}