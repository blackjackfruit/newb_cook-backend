const BackendErrorReasons = {
    USERNAME_PASSWORD_INVALID: 'username_password_invalid', // Username or password is invalid
    INVALID_TOKEN: 'invalid_token', // Token is expected to be parsed but is not possible to parse
    INVALID_TOKEN_MALFORMED: 'invalid_token_malformed',
    INVALID_REFRESH_TOKEN: 'invalid_refresh_token', // Refresh token is not valid possibly due to another device being logged in
    INVALID_USER_ID: 'invalid_user_id', // User ID is not valid
    SESSION_EXPIRED: 'session_expired', // Token is valid but session is expired
    SESSION_INVALID: 'session_invalid', // Token is valid but session is invalid (e.g. user logged out)
    UNKNOWN: 'unknown'
}
class BackendErrors extends Error {
    constructor(message, status_code, reason) {
        super(message)
        this.status_code = status_code
        if (reason == null) {
            this.reason = BackendErrorReasons.UNKNOWN
        }
        else {
            this.reason = reason
        }
    }

    json_formatted_error() {
        return {
            message: this.message,
            status_code: this.status_code,
            reason: this.reason
        }
    }
}

module.exports = { BackendErrors: BackendErrors, BackendErrorReasons };