const request = require('supertest')
const server = require('../server')
const backend = require('../APIs/common/backend_json')
const { response } = require('express')
const root_dir = require('../APIs/common/find_root_dir').root_dir
const { encode_jwt } = require('../APIs/common/jwt_helper')
const app = server.app

const SECRET = 'SECRET'
const OLD_ACCESS_TOKEN = encode_jwt(1, SECRET, 1)
const OLD_REFRESH_TOKEN = encode_jwt(1, SECRET, 2)
var g_access_token = null

describe('POST /retrieve_list_names Happy Case', () => {
    // setup the test
    beforeEach(() => {
        backend.setup_user_dir()
        backend.delete_all_users()
        const user_id = backend.get_user_id('test', 'test')
        backend.update_session(user_id, OLD_ACCESS_TOKEN, OLD_REFRESH_TOKEN)
        const access_token = backend.get_access_token(user_id)
        g_access_token = access_token
    })

    it('should retrieve list names if token is valid', () => {
        return request(app)
        .get('/retrieve_list_names')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect(200)
        .then((response) => {
            if (!('response' in response.body)) throw "response not in response.body"
            if (!('list_names' in response.body.response)) throw "list_names not in response.body.response"
            if (!Array.isArray(response.body.response.list_names)) throw "list_names is not an array"
            if (response.body.response.list_names.length != 0) throw "list_names does not have 0 elements"
        })
    })

    it('should retrieve list names for the user which they were created', () => {
        return request(app)
        .post('/create_new_list')
        .send({
            "list_name": 'test_list1'
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .then(function() {
            return request(app)
            .post('/create_new_list')
            .send({
                "list_name": 'test_list2'
            })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + g_access_token)
            .then(function() {
                return request(app)
                .get('/retrieve_list_names')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + g_access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    if (!('response' in response.body)) throw "response not in response.body"
                    if (!('list_names' in response.body.response)) throw "list_names not in response.body.response"
                    if (!Array.isArray(response.body.response.list_names)) throw "list_names is not an array"
                    if (response.body.response.list_names.length != 2) throw "list_names does not have 2 elements"
                    if (response.body.response.list_names[0].list_name != 'test_list1') throw "list_names[0] is not test_list1"
                    if (response.body.response.list_names[1].list_name != 'test_list2') throw "list_names[1] is not test_list2"
                })
            })
        })
    })
})

describe('POST /retrieve_list_names Sad Case', () => {
    it('should return error if token is not valid', () => {
        return request(app)
        .get('/retrieve_list_names')
        .set('Accept', 'application/json')
        .set('Authorization', 'xxx')
        .expect('Content-Type', /json/)
        .expect(400)
    })
})