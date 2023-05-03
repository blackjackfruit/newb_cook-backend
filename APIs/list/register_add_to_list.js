
const { BackendErrors } = require('../common/backend_errors')
const backend = require('../common/backend_json')
const response_handling = require('../common/response_handling')
const { get_access_token } = require('../common/jwt_helper')
const { convert_to_type, CONVERT_TYPE } = require('../common/convert_input')

function register_add_item_to_list(app) {
    app.post('/add_new_item_to_list', (request, response) => {
        let list_id = -1
        try {
            const token         = convert_to_type(get_access_token(request.headers.authorization), CONVERT_TYPE.string)
            const list_name     = convert_to_type(request.body.list_name, CONVERT_TYPE.string)
            const entry_name    = convert_to_type(request.body.entry_name, CONVERT_TYPE.string)

            if (token == null || list_name == null || entry_name == null) {
                throw new BackendErrors('Missing required fields.', 400, null)
            }
            const user_id = backend.get_user_id_from_token(token)
            if (user_id == null) {
                throw new BackendErrors('Could not find user_id for token ' + token + ' provided', 400, null)
            }

            list_id = backend.get_list_id_from_list_name(user_id, list_name)
            if (list_id == -1) {
                throw new BackendErrors('Could not find list_id for list_name ' + list_name + ' provided', 400, null)
            }
            var new_entry = {
                "entry_is_check_marked": false,
                "entry_name": entry_name
            }
            var new_entry = backend.add_new_entry_to_list(user_id, list_id, entry_name, false)
            response_handling.return_success_to_client(response, 200, new_entry)
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        }
    })
}

module.exports = {
    register_add_item_to_list
}