const jsonwebtoken = require('jsonwebtoken')
const request = require('supertest')
const server = require('../server')
const backend = require('../APIs/common/backend_json')
const { encode_jwt } = require('../APIs/common/jwt_helper')
const { root_dir } = require('../APIs/common/find_root_dir')

const APP = server.app
var g_access_token = null
const SECRET = 'SECRET'
var OLD_ACCESS_TOKEN = encode_jwt(1, SECRET, 1)
var OLD_REFRESH_TOKEN = encode_jwt(1, SECRET, 2)

function generate_new_tokens() {
    return request(APP)
        .post('/jwt_life_cycle_maintainer_get_new_token')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + OLD_REFRESH_TOKEN)
        .expect('Content-Type', /json/)
}

describe('/POST to jwt_maintainer attempt to get latest jwt', () => {
    // setup the test
    beforeEach(() => {
        backend.setup_user_dir()
        backend.delete_all_users()
        const user_id = backend.get_user_id('test', 'test')
        backend.update_session(user_id, OLD_ACCESS_TOKEN, OLD_REFRESH_TOKEN)
        const access_token = backend.get_access_token(user_id)
        g_access_token = access_token
    })

    // Upon login the token is returned along with the refresh token in the response
    // save the response's refresh token and use it to get a new jwt and then compare
    // the new jwt with the old jwt
    it('should get a new token when provided with a valid refresh token', () => {
        const OLD_ACCESS_TOKEN = jsonwebtoken.sign({'user_id': 1}, SECRET, {expiresIn: '10s'})
        return generate_new_tokens()
        .expect(200)
        .then((response) => {
                if (!('response' in response.body)) throw "response not in response.body"
                if (!('token' in response.body.response)) throw "token not in response.body.response"
                if (!('refresh_token' in response.body.response)) throw "refresh_token not in response.body.response"
                const new_token = response.body.response.token
                const new_refresh_token = response.body.response.refresh_token
                if (OLD_ACCESS_TOKEN == new_token) throw "old_token == refresh_token"
                if (OLD_REFRESH_TOKEN == new_refresh_token) throw "new_refresh_token == refresh_token"
                expect(response.body).toEqual({
                    "response": {
                        "token": expect.any(String),
                        "refresh_token": expect.any(String)
                    }
                })
        })
    })

    it('should return error when attempting to get a new token when providing an invalid refresh token', () => {
        return request(APP)
        .post('/jwt_life_cycle_maintainer_get_new_token')
        .send({
            "authentication": {
                "token": "invalid",
                "refresh_token": "invalid"
            }
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })

    it('should return error when attempting to get a new token when provided a refresh token which cannot be found', () => {
        const non_valid_access_token = encode_jwt(9999, SECRET, 1)
        const non_valid_refresh_token = encode_jwt(9999, SECRET, 1)
        return request(APP)
            .post('/jwt_life_cycle_maintainer_get_new_token')
            .send({
                "authentication": {
                    "refresh_token": non_valid_refresh_token
                }
            })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + non_valid_access_token)
            .expect('Content-Type', /json/)
            .expect(401)
        })
})

describe('/PATCH jwt_life_cycle_maintainer session validation', () => {
    // setup the test
    beforeEach(() => {
        backend.setup_user_dir()
        backend.delete_all_users()
        const user_id = backend.get_user_id('test', 'test')
        backend.update_session(user_id, OLD_ACCESS_TOKEN, OLD_REFRESH_TOKEN)
        const access_token = backend.get_access_token(user_id)
        g_access_token = access_token
    })

    it('should save the new token when provided with a valid token', () => {
        return generate_new_tokens()
        .expect(200)
        .then((response) => {
            if (!('response' in response.body)) throw "response not in response.body"
            if (!('token' in response.body.response)) throw "token not in response.body.response"
            const new_token = response.body.response.token
            const new_refresh_token = response.body.response.refresh_token
            return request(APP)
            .patch('/jwt_life_cycle_maintainer_save_new_token')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + new_token)
            .expect(200)
        })
    })
    
    it('should return error when attempting to save a new token when provided with a invalid token', () => {
        const non_valid_access_token = encode_jwt(9999, SECRET, 1)
        return request(APP)
        .patch('/jwt_life_cycle_maintainer_save_new_token')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + non_valid_access_token)
        .expect(400)
    })
})

describe('/HEAD jwt_life_cycle_maintainer session validation', () => {
    // setup the test
    beforeEach(() => {
        backend.setup_user_dir()
        backend.delete_all_users()
        const user_id = backend.get_user_id('test', 'test')
        backend.update_session(user_id, OLD_ACCESS_TOKEN, OLD_REFRESH_TOKEN)
        const access_token = backend.get_access_token(user_id)
        g_access_token = access_token
    })

    it('should return 200 when provided with a valid token', () => {
        return request(APP)
        .head('/jwt_life_cycle_maintainer_status')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + OLD_ACCESS_TOKEN)
        .expect(200)
    })

    it('should return 401 when provided with an invalid session where the user doesn\'t exist', () => {
        const invalid_token = encode_jwt(99999, SECRET, 1)
        return request(APP)
        .head('/jwt_life_cycle_maintainer_status')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + invalid_token)
        .expect(401)
    })

    it('should return 400 when provided with an invalid formatted token', () => {
        return request(APP)
        .head('/jwt_life_cycle_maintainer_status')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + 'xxxx')
        .expect(400)
    })

    it('should return 401 when provided when the access token was created in the past and exp is in the past', () => {
        // create a jwt payload that is 10 seconds in the past and sign it
        const seconds = 300
        const payload = {
            user_id: 1,
            iat: Math.floor(Date.now() / 1000) - seconds,
            exp: Math.floor(Date.now() / 1000) + 30 - seconds
        }
        const token = jsonwebtoken.sign(payload, SECRET)
        return request(APP)
        .head('/jwt_life_cycle_maintainer_status')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .expect(401)
    })
})