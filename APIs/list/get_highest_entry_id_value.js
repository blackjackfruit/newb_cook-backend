import { return_all_list_names } from "./return_all_list_names"
import { get_entries } from "./fetch_list_from_backend"

// Go through all list_name files and return the highest entry_id value
function get_highest_entry_id_value(token) {
    let list_names = return_all_list_names(token)
    var highest_entry_id_value = 0
    for (let list_name of list_names) {
        var entries = get_entries(token, list_name)
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