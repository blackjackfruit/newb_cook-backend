const { BackendErrors } = require("../common/backend_errors")
const backend = require("../common/backend_json")
const { get_access_token } = require("../common/jwt_helper")
const response_handling = require("../common/response_handling")
const { convert_to_type, CONVERT_TYPE } = require("../common/convert_input")

function search(token, list_name, search_request) {
    var entries = backend.get_entries_using_list_name(token, list_name)
    if (entries == null) {
        throw "Entries was null or list_id " + list_id + " provided for the list " + list_name + " provided."
    }
    entries = entries.list_entries
    var entries_to_return = []
    for (let entry of entries) {
        if (entry.entry_is_hidden == false && entry.entry_name.toLowerCase().includes(search_request.toLowerCase())) {
            entries_to_return.push({
                "list_id": backend.get_file_name_from_list_name(token, list_name),
                "list_name": list_name,
                "section_id": 100,
                "section_name": "Other",
                "section_type": entry.entry_is_check_marked ? "completed" : "uncompleted",
                "entry_id": entry.entry_id,
                "entry_name": entry.entry_name,
                "entry_is_check_marked": entry.entry_is_check_marked,
            })
        }
    }
    return entries_to_return
}

function register_find_items_for_user(app) {
    app.get('/find_items_for_user', (request, response) => {
        try {
            const token = convert_to_type(get_access_token(request.headers.authorization), CONVERT_TYPE.string)
            const list_name = request.query.list_name
            const search_request = request.query.search_request
            if (token == null || list_name == null || search_request == null) {
                throw new BackendErrors('Missing required fields.', 400, null)
            }
            const user_id = backend.get_user_id_from_token(token)
            if (user_id == null) {
                throw new BackendErrors('Could not find user_id for token ' + token + ' provided', 400, null)
            }

            const entries = search(user_id, list_name, search_request)
            if (entries == null) {
                throw new BackendErrors('Could not find entries for list_name ' + list_name + ' provided', 400, null)
            }
            response_handling.return_success_to_client(response, 200, entries)
        } catch (error) {
            response_handling.return_failure_to_client(response, error)
        }
    })
}

module.exports = {
    register_find_items_for_user
}