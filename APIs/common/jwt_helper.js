const fs = require('fs')
const jsonwebtoken = require('jsonwebtoken')
const { BackendErrors, BackendErrorReasons } = require('./backend_errors')
const root_dir = require('./find_root_dir').root_dir

function is_token_valid(token, secret) {
    return jsonwebtoken.verify(token, secret, (error, decoded) => {
        if (error) {
            if (error instanceof jsonwebtoken.TokenExpiredError) {
                throw new BackendErrors('Token expired.', 401, BackendErrorReasons.SESSION_EXPIRED)
            }
            throw new BackendErrors('Unknown: ' + error, 401, BackendErrorReasons.INVALID_TOKEN_MALFORMED)
        }
        return true
    })
}
function get_access_token(token) {
    if (token == null) {
        return null
    }
    if (token.startsWith('Bearer ')) {
        return token.slice(7, token.length)
    }
    return null
}

function get_jwt_payload_from_token(token, secret) {
    // If token is null, then decode_jwt will throw an error
    if (token == null) {
        throw new BackendErrors('Missing required fields', 400, BackendErrorReasons.INVALID_TOKEN)
    }
    const decoded_jwt = decode_jwt(token, secret)
    if (decoded_jwt == null) {
        throw new BackendErrors('Invalid token, unable to decode', 400, BackendErrorReasons.INVALID_TOKEN_MALFORMED)
    }
    if (decoded_jwt instanceof Error) {
        throw new BackendErrors('Invalid token, unable to decode', 401, BackendErrorReasons.INVALID_TOKEN_MALFORMED)
    }  
    return decoded_jwt
}

function decode_jwt(token, secret) {
    var base64Payload = token.split(".")[1];
    
    if (base64Payload == null) {
        return null
    }
    var payloadBuffer = Buffer.from(base64Payload, "base64");
    let json = JSON.parse(payloadBuffer.toString());
    const is_valid = is_token_valid(token, secret)
    if (is_valid instanceof Error) {
        throw is_valid
    }
    return json
}

function encode_jwt(user_id, secret, expires_in_hours) {
    return jsonwebtoken.sign({'user_id': user_id}, secret, {expiresIn: String(expires_in_hours) + 'h'})
}

// Compare the access_token with what is in the database's user.json with the current time
function is_token_expired(token, secret) {
    let user_id = null
    let expiration_date = null 
    try {
        // decode the access token and get the expiration date
        const decoded = get_jwt_payload_from_token(token, secret)
        user_id = decoded.user_id
        expiration_date = decoded.exp
        if (expiration_date < Date.now() / 1000) {
            return true
        }
        const user_json = root_dir() + '/users.json'
        const jsonFile = fs.readFileSync(user_json)
        const json = JSON.parse(jsonFile)
        for (let user of json.registered_users) {
            if (user.user_id == user_id) {
                return false
            }
        }
    } catch {
        return true
    }
    
    return true
}


module.exports = {
    is_token_valid,
    get_access_token,
    get_jwt_payload_from_token,
    decode_jwt,
    encode_jwt,
    is_token_expired
}