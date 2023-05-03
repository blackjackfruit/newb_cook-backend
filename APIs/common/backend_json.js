
// read from file system
const fs = require('fs')
const root_dir = require('./find_root_dir').root_dir
const { BackendErrors, BackendErrorReasons } = require('./backend_errors')
const jwt_helper = require('./jwt_helper')

const g_database_dir = root_dir() + '/database'
const g_users_json = '/users.json'
const g_user_list_dir = '/user_lists'
const g_all_lists_dir = '/all_lists'

// Read the users.json file and return true if the user_id is valid
function is_user_id_valid(user_id) {
     if (user_id == null) {
        return false
    }
    const jsonFile = fs.readFileSync(g_database_dir + g_users_json)
    const json = JSON.parse(jsonFile)
    for (let user of json.registered_users) {
        if (user.user_id == user_id) {
            return true
        }
    }
    return false
}

// Search through user's folder structure using tokne to find the list_name within the .json file and return it
function get_list_name_using_list_id(session_token, list_id) {
    const jsonFilePath = g_database_dir + g_user_list_dir + '/' + session_token + '/' + list_id + '.json'
    var jsonFile = fs.readFileSync(jsonFilePath)
    var json = JSON.parse(jsonFile)
    return json.list_name
}

function get_list_id_using_entry_id(session_token, find_entry_id) {
    // loop though .json files and search within the json file and compare entry_id within the file with find_entry_id parameter
    // and return the list_id if entry_id is equal to find_entry_id
    var jsonFiles = fs.readdirSync(g_database_dir + g_user_list_dir + '/' + session_token)
    for (let file of jsonFiles) {
        if (file.includes('.json')) {
            const jsonFilePath = g_database_dir + g_user_list_dir + '/' + session_token + '/' + file
            const jsonFile = fs.readFileSync(jsonFilePath)
            const json = JSON.parse(jsonFile)
            for (let entry of json.list_entries) {
                if (entry.entry_id == find_entry_id) {
                    return parseInt(file.replace('.json', ''))
                }
            }
        }
    }
    return null
}

// function which reads the json file from the user's folder structure and return it if the list_id is equal to the list_id provided
function get_entries_using_list_id(session_token, list_id) {
    const jsonFilePath = g_database_dir + g_user_list_dir + '/' + session_token + '/' + list_id + '.json'
    var jsonFile = fs.readFileSync(jsonFilePath)
    var json = JSON.parse(jsonFile)
    return json
}

function get_file_name_from_list_name(session_token, file_list_name) {
    // loop though .json files and search within the json file and compare list_name within the file with file_list_name parameter 
    // and return the json file if list_name is equal to file_list_name
    var jsonFiles = fs.readdirSync(g_database_dir + g_user_list_dir + '/' + session_token)
    for (let file of jsonFiles) {
        if (file.includes('.json')) {
            const jsonFilePath = g_database_dir + g_user_list_dir + '/' + session_token + '/' + file
            const jsonFile = fs.readFileSync(jsonFilePath)
            const json = JSON.parse(jsonFile)
            const list_name = json.list_name
            if (list_name.toLowerCase() === file_list_name.toLowerCase()) {
                return parseInt(file.replace('.json', ''))
            }
        }
    }
    return null
}

// function which read json file from user's folder structure and return it's entries
function get_entries_using_list_name(session_token, file_list_name) {
    // loop though .json files and search within the json file and compare list_name within the file with file_list_name parameter 
    // and return the json file if list_name is equal to file_list_name
    var jsonFiles = fs.readdirSync(g_database_dir + g_user_list_dir + '/' + session_token)
    for (let file of jsonFiles) {
        if (file.includes('.json')) {
            const jsonFilePath = g_database_dir + g_user_list_dir + '/' + session_token + '/' + file
            const jsonFile = fs.readFileSync(jsonFilePath)
            const json = JSON.parse(jsonFile)
            const list_name = json.list_name
            if (list_name.toLowerCase() === file_list_name.toLowerCase()) {
                return json
            }
        }
    }
    return null
}

function setup_user_dir() {
    // if the user folder doesn't exist, create it
    if (!fs.existsSync(g_database_dir)) {
        fs.mkdirSync(g_database_dir)
    }
    
    const user_dir = g_database_dir +  g_user_list_dir
    if (!fs.existsSync(user_dir)) {
        fs.mkdirSync(user_dir)
    }

    const list_dir = g_database_dir + g_all_lists_dir
    if (!fs.existsSync(list_dir)) {
        fs.mkdirSync(list_dir)
    }
    
    // if the users.json doesn't exist, create it and a default user
    const user_json = g_database_dir + g_users_json
    if (!fs.existsSync(user_json)) {
        const registered_users = {
            "registered_users": [
                {
                    "username": "test",
                    "password": "test", 
                    "user_id": "1",
                    "access_token": "",
                }
            ]
        }
        fs.writeFileSync(user_json, JSON.stringify(registered_users))
        fs.mkdirSync(user_dir + '/1')
    }
}

function update_session_to_permanent_status(new_access_token) {
    const user_json = g_database_dir + g_users_json
    const jsonFile = fs.readFileSync(user_json)
    const json = JSON.parse(jsonFile)
    const user_id = jwt_helper.decode_jwt(new_access_token, 'SECRET').user_id
    let user_found = false 
    for (let user of json.registered_users) {
        if (user.user_id == user_id) {
            user.access_token = new_access_token
            user.refresh_token = user.temp_refresh_token
            user.temp_refresh_token = ""
            user.temp_access_token = ""
            user_found = true
        }
    }

    if (user_found) {
        fs.writeFileSync(user_json, JSON.stringify(json))
        return true
    }
    throw new BackendErrors("User not found", 401, BackendErrorReasons.INVALID_USER_ID) 
}

function temp_save_session(refresh_token, new_access_token, new_refresh_token) {
    const user_json = g_database_dir + g_users_json
    const jsonFile = fs.readFileSync(user_json)
    const json = JSON.parse(jsonFile)
    let user_found = false 
    for (let user of json.registered_users) {
        if (user.refresh_token == refresh_token) {
            user.temp_access_token = new_access_token
            user.temp_refresh_token = new_refresh_token
            user_found = true
        }
    }
    if (user_found) {
        fs.writeFileSync(user_json, JSON.stringify(json))
        return
    }
    throw new BackendErrors("User not found", 401, null)
}
function update_session(user_id, token, refresh_token) {
    const user_json = g_database_dir + g_users_json
    const jsonFile = fs.readFileSync(user_json)
    const json = JSON.parse(jsonFile)
    let user_found = false 
    for (let user of json.registered_users) {
        if (user.user_id == user_id) {
            user.access_token = token
            user.refresh_token = refresh_token
            user_found = true
        }
    }
    if (user_found) {
        fs.writeFileSync(user_json, JSON.stringify(json))
        return true
    }
    return false
}

function get_access_token(user_id) {
    const user_json = g_database_dir + g_users_json
    const jsonFile = fs.readFileSync(user_json)
    const json = JSON.parse(jsonFile)
    for (let user of json.registered_users) {
        if (user.user_id == user_id) {
            return user.access_token
        }
    }
    return null
}

function get_user_id(username, password) {
    const user_json = g_database_dir + g_users_json
    const jsonFile = fs.readFileSync(user_json)
    const json = JSON.parse(jsonFile)
    for (let user of json.registered_users) {
        if (user.username == username && user.password == password) {
            return user.user_id
        }
    }
    return null
}


function get_user_id_from_token(access_token) {
    // Get all users
    const all_users = fs.readFileSync(g_database_dir + g_users_json)
    const users = JSON.parse(all_users).registered_users
    if (users == null) {
        return null
    }
    const user = users.find(user => user.access_token == access_token)
    if (user) {
        const path = g_database_dir + g_user_list_dir + "/" + user.user_id
        // Does directory exist?
        const user_dir = fs.existsSync(path)
        if (user_dir) {
            return user.user_id
        }
    }
    return null
}

// if one does not exist then create the file and return the list_id, else return an error
function create_new_list_name(user_id, new_list_name) {
    // loop through all files in list to find the highest list_id
    var all_lists_names_found = fs.readdirSync(g_database_dir + g_all_lists_dir)
    var highest_list_id = 0

    for (let list_name of all_lists_names_found) {
        const list_name_found = list_name.replace('.json', '')
        if (list_name_found > highest_list_id)  {
            highest_list_id = parseInt(list_name_found)
        }
    }
    highest_list_id += 1
    var entries = {
        "list_name": new_list_name,
        "list_entries": []
    }
    fs.writeFileSync(g_database_dir + g_all_lists_dir + '/' + highest_list_id + '.json', JSON.stringify(entries))
    fs.symlinkSync(
        g_database_dir + g_all_lists_dir + '/' + highest_list_id + '.json',
        g_database_dir + g_user_list_dir + '/' + user_id + "/" + highest_list_id + '.json'
    )

    return highest_list_id
}

function get_list_name_from_list_id(list_id) {
    const list_json = g_database_dir + g_all_lists_dir + '/' + list_id + '.json'
    if (!fs.existsSync(list_json)) {
        return null
    }
    const jsonFile = fs.readFileSync(list_json)
    const json = JSON.parse(jsonFile)
    return json.list_name
}

function get_list_names_from_user_id(user_id) {
    const user_list_path = g_database_dir + g_user_list_dir + "/" + user_id
    const files = fs.readdirSync(user_list_path)
    var list_names = []
    for (let file of files) {
        var list_id = file.replace(".json", "")
        var list_name = get_list_name_from_list_id(list_id)
        if (list_name == null) {
            continue
        }
        const json = {
            "list_id": list_id,
            "list_name": list_name
        }
        list_names.push(json)
    }
    return list_names
}

function delete_all_users() {
    if (g_database_dir == null) {
        return false
    }
    fs.rmSync(g_database_dir + g_user_list_dir, { recursive: true })
    fs.rmSync(g_database_dir + g_all_lists_dir, { recursive: true })
    fs.rmSync(g_database_dir + g_users_json)
    setup_user_dir(g_database_dir)

    return true
}

function remove_list_name(user_id, list_name) {
    const file_names = fs.readdirSync(g_database_dir + g_user_list_dir + '/' + user_id);
    for (let file_name of file_names) {
        var file_path = g_database_dir + g_user_list_dir + '/' + user_id + "/" + file_name;
        var file = fs.readFileSync(file_path)
        var file_list_name = JSON.parse(file).list_name;
        if (list_name.toLowerCase() == file_list_name.toLowerCase()) {
            fs.rmSync(file_path);
            break
        }
    }
}

// Retrieve list names from user's folder structure based off of the token
function retrieve_list_names(user_id) {
    // Get the path to the user's folder
    const user_dir = g_database_dir + g_user_list_dir + '/' + user_id
    // Get the list of files in the user's folder
    const files = fs.readdirSync(user_dir);
    // Find all json files and return them without the .json extension
    const list_names = [];
    for (let file of files) {
        if (file.endsWith(".json")) {
            // look into the json file and get the list_name
            const json_file_path = user_dir + "/" + file;
            const jsonFile = fs.readFileSync(json_file_path);
            const json = JSON.parse(jsonFile);
            const list_id = file.replace(".json", "") + "";
            const returnValue = {
                list_id: list_id,
                list_name: json.list_name
            };

            list_names.push(returnValue);
        }
    }
    return list_names;
}
function update_list_entry_name(
    token,
    list_id,
    list_name,
    entry_id,
    entry_name,
    entry_is_check_marked
) {
    var entries = get_entries_using_list_id(token, list_id)
    if (entries == null) {
        throw "Entries was null or list_id "+ list_id +" provided for the list " + list_name + " provided."
    }
    entries = entries.list_entries
    var index = 0
    var did_find_entry = false
    while (index < entries.length) {
        if (entries[index].entry_id == entry_id) {
            did_find_entry = true
            break
        }
        index += 1
    }
    if (did_find_entry == false) {
        throw "Could not find entry with the id "+ entry_id +" provided for the list " + list_name + " provided."
    }
    entries[index].entry_name = entry_name
    entries[index].entry_is_check_marked = entry_is_check_marked
    const json = {
        "list_name": list_name,
        "list_entries": entries
    }
    fs.writeFileSync(g_database_dir + g_all_lists_dir + '/' + list_id + '.json', JSON.stringify(json))

    return {
        "list_id": list_id,
        "list_name": list_name,
        "section_id": 100,
        "section_name": "Other",
        "section_type": entry_is_check_marked ? "completed" : "uncompleted",
        "entry_id": entry_id,
        "entry_name": entry_name,
        "entry_is_check_marked": entry_is_check_marked
    }
}

function delete_entry(token, entry_id) {
    var list_id = get_list_id_using_entry_id(token, entry_id)
    if (list_id == null) {
        throw new BackendErrors("Could not find list_id for entry_id " + entry_id + " provided.", 400, null)
    }
    var list_name = get_list_name_using_list_id(token, list_id)
    if (list_name == null) {
        throw new BackendErrors("Could not find list_name for list_id " + list_id + " provided.", 400, null)
    }
    var entries = get_entries_using_list_id(token, list_id)
    entries = entries.list_entries

    var entry_index = 0
    var entry_to_hide = 0
    var did_find_entry = false
    
    while (entry_index < entries.length) {
        if (entries[entry_index].entry_id == entry_id) {
            entry_to_hide = entry_index
            entries[entry_index].entry_is_hidden = true
            did_find_entry = true
            break
        }
        entry_index += 1
    }
    if (did_find_entry) {
        const json = {
            "list_name": list_name,
            "list_entries": entries
        }
        fs.writeFileSync(g_database_dir + g_user_list_dir + '/' + token + "/" + list_id + ".json", JSON.stringify(json))
    } else {
        throw new BackendErrors("Could not find entry with the id "+ entry_id +" provided for the list " + list_name + " provided.", 400, null)
    }
}

// Go through all list_name files and return the highest entry_id value
function get_highest_entry_id_value(token) {
    let list_ids = return_all_list_names(token)
    var highest_entry_id_value = 0
    for (let list_id of list_ids) {
        var entries = get_entries_using_list_id(token, list_id)
        entries = entries.list_entries

        var index = 0
        while (index < entries.length) {
            if (entries[index].entry_id > highest_entry_id_value) {
                highest_entry_id_value = entries[index].entry_id
            }
            index += 1
        }
    }
    return highest_entry_id_value
}

// Loop through the files in the user's directory by search inside the json files for the list_name
// and return the list id based off of the file's name without the extension
function get_list_id_from_list_name(user_id, list_name) {
    const path_to_read = g_database_dir + g_user_list_dir + '/' + user_id
    var list_id = -1
    
    // Loop through all the files in the user's directory
    fs.readdirSync(path_to_read).forEach(file => {
        // If the file is a json file
        if (file.includes('.json')) {
            // see inside the file to see if the list_name is inside it
            var jsonFile = fs.readFileSync(path_to_read + '/' + file)
            jsonFile = JSON.parse(jsonFile)

            if (jsonFile.list_name.toLowerCase() == list_name.toLowerCase()) {
                // If the list_name is inside the file, return the list_id
                list_id = file.replace('.json', '')
            }
        }
    })

    if (list_id != null) {
        return list_id
    } else {
        throw new Error("Could not find xxx list_name")
    }
}

// Function which takes token and list_name to create a file if it does not exist and waits until the file is created
// before continuing.
function create_file_if_does_not_exist(token, list_name) {
    const path_to_write = g_database_dir + g_user_list_dir + '/' + token + '/' + list_name + '.json'
    if (!fs.existsSync(path_to_write)) {
        // Create the file
        fs.writeFileSync(path_to_write, JSON.stringify([]))
        // Wait until the file is created
    }
}

// When typing in a new entry for a section, this function will return that an item exists or not
// in the list while the user is typing.
function add_new_entry_to_list(token, list_id, entry_name, entry_is_check_marked) {
    var highest_entry_id_value = get_highest_entry_id_value(token)

    var entries = get_entries_using_list_id(token, list_id)
    const list_name = entries.list_name
    entries = entries.list_entries

    highest_entry_id_value += 1
    var new_entry = {
        "entry_is_hidden": false,
        "entry_id": highest_entry_id_value,
        "entry_is_check_marked": entry_is_check_marked,
        "entry_name": entry_name
    }
    entries.unshift(new_entry)
    const path_to_write = g_database_dir + g_all_lists_dir + '/' + list_id + '.json'
    
    var json = {
        "list_name": list_name,
        "list_entries": entries
    }
    fs.writeFileSync(path_to_write, JSON.stringify(json))

    return {
        "list_id": parseInt(list_id),
        "list_name": list_name,
        "section_id": 100,
        "section_name": "Other",
        "section_type": entry_is_check_marked ? "completed" : "uncompleted",
        "entry_id": highest_entry_id_value,
        "entry_name": entry_name,
        "entry_is_check_marked": entry_is_check_marked
    } 
}

// Return all files within the users directory's sub directory which match the token without the .json extension
function return_all_list_names(user_id) {
    const path = g_database_dir + g_user_list_dir + '/' + user_id
    // Get all files within the users directory
    var files = fs.readdirSync(path)
    // remove the extension from the file name
    var index = 0
    while (index < files.length) {
        files[index] = files[index].replace(".json", "")
        index += 1
    }
    return files
}

// Based off of the token, check to see if the user exists and that the token is valid is the same 
// as what is stored in the database
function is_refresh_token_valid(token) {
    // decode the token to get the user_id using decode_jwt
    const decoded_token = jwt_helper.decode_jwt(token, 'SECRET')
    const user_id = decoded_token.user_id
    // Check the database to see if the user_id exists
    const path_to_read = g_database_dir + '/users.json'

    // Get the registered_users from path_to_read
    var registered_users = fs.readFileSync(path_to_read)
    registered_users = JSON.parse(registered_users).registered_users
    // Read the file and find the registered_users and get the user_id's refresh_token
    // to compare to the token passed in
    for (var i = 0; i < registered_users.length; i++) {
        if (registered_users[i].user_id == user_id) {
            if (registered_users[i].refresh_token == token) {
                return true
            }
        }
    }
    return false
}

module.exports = {
    is_user_id_valid,
    setup_user_dir,
    get_list_name_using_list_id,
    get_list_id_using_entry_id,
    get_entries_using_list_id,
    get_file_name_from_list_name,
    get_entries_using_list_name,
    update_session,
    get_access_token,
    get_user_id,
    delete_all_users,
    get_user_id_from_token,
    get_list_names_from_user_id,
    create_new_list_name,
    remove_list_name,
    retrieve_list_names,
    update_list_entry_name,
    delete_entry,
    get_list_id_from_list_name,
    create_file_if_does_not_exist,
    add_new_entry_to_list,
    return_all_list_names,
    temp_save_session,
    update_session_to_permanent_status,
    is_refresh_token_valid
}
