const response_handling = require('../common/response_handling')
const backend = require('../common/backend_json')
const { get_access_token } = require('../common/jwt_helper')
const { BackendErrors } = require('../common/backend_errors')

const SECRET = 'SECRET'

function get_list_from_token_with_direction(token, list_name, direction_to_read_list) {
    var all_entries = backend.get_entries_using_list_name(token, list_name)
    if (all_entries == null) {
        throw "Could not find list with the name "+ list_name +" provided."
    }
    all_entries = all_entries.list_entries
    var entries = []
    if (direction_to_read_list === "initial") { // initial
        for (let entry of all_entries) {
            entry['list_id'] = backend.get_file_name_from_list_name(token, list_name)
            entry['list_name'] = list_name
            entry['section_id'] = 100
            entry['section_name'] = "Other"
            entry['section_type'] = entry.entry_is_check_marked ? "completed" : "uncompleted"
            if (entry.entry_is_hidden == false) {
                delete entry.entry_is_hidden
                entries.push(entry)
            }
        }

        return entries
    } else {
        throw "Direction to read list is unsupported"
    }
}

// function which retrives items to the list using express as an input
function register_retrieve_list(app) {
    app.get('/retrieve_list', (request, response) => {
        try {
            var token = request.headers.authorization
            token = get_access_token(token, SECRET)
            const direction_to_read_list = request.query.direction_to_read_list
            const list_name = request.query.list_name
            if (token == null || direction_to_read_list == null || list_name == null) {
                throw new BackendErrors("Malformed parameter(s) provided.", 400, null)
            }
            const user_id = backend.get_user_id_from_token(token)
            if (user_id == null) {
                throw new BackendErrors("Could not find user_id for token " + token + " provided.", 400, null)
            }
            const list = get_list_from_token_with_direction(user_id, list_name, direction_to_read_list)
            if (list == null) {
                throw new BackendErrors("Could not find list with the name "+ list_name +" provided.", 400, null)
            }

            response_handling.return_success_to_client(response, 200, list)
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        }
    })
}

module.exports = {
    register_retrieve_list
}