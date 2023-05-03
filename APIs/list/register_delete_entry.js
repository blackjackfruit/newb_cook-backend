const response_handling = require('../common/response_handling')
const backend = require('../common/backend_json')
const { BackendErrors } = require('../common/backend_errors')
const { convert_to_type, CONVERT_TYPE } = require('../common/convert_input')
const { get_access_token } = require('../common/jwt_helper')

function register_delete_entry(app) {
    app.delete('/delete_entry', (request, response) => {    
        try {
            const token     = convert_to_type(get_access_token(request.headers.authorization), CONVERT_TYPE.string)
            const entry_id  = convert_to_type(request.query.entry_id, CONVERT_TYPE.number)

            if (token == null || entry_id == null) {
                throw new BackendErrors('Missing required fields.', 400, null)
            }
            const user_id = backend.get_user_id_from_token(token)
            if (user_id == null) {
                throw new BackendErrors('Could not find user_id for token ' + token + ' provided', 400, null)
            }
            backend.delete_entry(user_id, entry_id)
            response_handling.return_success_to_client(response, 200, {})
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        }
    })
}

module.exports = {
    register_delete_entry
}