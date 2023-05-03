
const CONVERT_TYPE = {
    string: 'string',
    number: 'number',
    boolean: 'boolean'
}

// First parameter input is of any type and the second parameter is the type to convert to if possible, null if not possible
// Returns the converted value or null if not possible
function convert_to_type(input, type) {
    if (type == null || input == null) {
        return null
    }
    if (type == 'string') {
        return input.toString()
    }
    if (type == 'number') {
        return Number(input)
    }
    if (type == 'boolean') {
        if (typeof input == 'boolean') {
            return input
        }
        switch (input.toLowerCase().trim()) {
            case 'true':
            case 'yes':
            case '1':
                return true
            case 'false':
            case 'no':
            case '0':
                return false
        }
    }
    return null
}

module.exports = {
    CONVERT_TYPE,
    convert_to_type
}