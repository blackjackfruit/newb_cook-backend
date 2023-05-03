const { BackendErrors } = require("./backend_errors")


function return_failure_to_client(response, backend_error) {
    response.set('Content-Type', 'application/json')
    if (backend_error == null || !(backend_error instanceof BackendErrors)) {
        const unhandled = BackendErrors('Unhandled error', 500, null)
        const json = {"response": unhandled.json_formatted_error()}
        response.json(json)
        return
    }
    response.status(backend_error.status_code)
    const json = {"response": backend_error.json_formatted_error()}
    response.json(json)
}
function return_success_to_client(response, status_code, additional_json) {
    response.set('Content-Type', 'application/json')
    response.status(status_code)
    const json = {"response": additional_json}
    response.json(json)
}

module.exports = {
    return_failure_to_client,
    return_success_to_client
}
