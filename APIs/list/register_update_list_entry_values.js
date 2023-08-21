const response_handling = require('../common/response_handling')
const backend = require('../common/backend_json')
const { get_access_token } = require('../common/jwt_helper')
const { CONVERT_TYPE, convert_to_type } = require('../common/convert_input')
const { BackendErrors } = require('../common/backend_errors')

function register_update_list_entry_values(app) {
    app.patch('/update_list_entry_values', (request, response) => {
        // TODO: If every input is valid, proceed
        try{
            const token                 = convert_to_type(get_access_token(request.headers.authorization), CONVERT_TYPE.string)
            const list_id               = convert_to_type(request.query.list_id, CONVERT_TYPE.number)
            const list_name             = convert_to_type(request.query.list_name, CONVERT_TYPE.string)
            const entry_id              = convert_to_type(request.query.entry_id, CONVERT_TYPE.number)
            const entry_name            = convert_to_type(request.query.entry_name, CONVERT_TYPE.string)
            const entry_is_check_marked = convert_to_type(request.query.entry_is_check_marked, CONVERT_TYPE.boolean)

            if (token == null || list_id == null || list_name == null || entry_id == null || entry_name == null || entry_is_check_marked == null) {
                var missingFields = "Missing the following fields: "
                missingFields += token == null ? "token " : ""
                missingFields += list_id == null ? "list_id " : ""
                missingFields += list_name == null ? "list_name " : ""
                missingFields += entry_id == null ? "entry_id " : ""
                missingFields += entry_name == null ? "entry_name " : ""
                missingFields += entry_is_check_marked == null ? "entry_is_check_marked " : ""
                throw new BackendErrors(missingFields, 400, null)
            }

            const user_id = backend.get_user_id_from_token(token)
            if (user_id == null) {
                throw new BackendErrors("Could not find user_id for token " + token + " provided.", 400, null)
            }

            const newLocationForItem = backend.update_list_entry_name(
                user_id,
                list_id,
                list_name,
                entry_id,
                entry_name,
                entry_is_check_marked
            )
            response_handling.return_success_to_client(response, 200, newLocationForItem)
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        }
    })
}

module.exports = {
    register_update_list_entry_values
}