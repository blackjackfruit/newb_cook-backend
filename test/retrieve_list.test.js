const request = require('supertest')
const server = require('../server')
const backend = require('../APIs/common/backend_json')
const { encode_jwt } = require('../APIs/common/jwt_helper')

const app = server.app
const SECRET = 'SECRET'
const OLD_ACCESS_TOKEN = encode_jwt(1, SECRET, 1)
const OLD_REFRESH_TOKEN = encode_jwt(1, SECRET, 2)
var g_access_token = null

describe('POST /retrieve_list cases', () => {
    // setup the test
    beforeEach(() => {
        backend.setup_user_dir()
        backend.delete_all_users()
        const user_id = backend.get_user_id('test', 'test')
        backend.update_session(user_id, OLD_ACCESS_TOKEN, OLD_REFRESH_TOKEN)
        const access_token = backend.get_access_token(user_id)
        g_access_token = access_token
    })

    it('should be able to create list', () => {
        return request(app)
        .post('/create_new_list')
        .send({
            "list_name": 'test_list'
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual({
                "response": {
                    "list_id": 1,
                    "list_name": "test_list"
                }
            })
        })
    })

    it('should retrieve items for the list', () => {
        return request(app)
        .post('/create_new_list')
        .send({
            "list_name": 'test_list'
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .then(function() {
            return request(app)
            .post('/add_new_item_to_list')
            .send({
                "list_name": 'test_list',
                "entry_name": 'test_entry'
            })
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + g_access_token)
            .expect(200)
            .then(function() {
                return request(app)
                .get('/retrieve_list')
                .query({
                    "list_name": 'test_list',
                    "direction_to_read_list": 'initial',
                    "number_of_sections_to_return": 1
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + g_access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual({
                        "response": expect.any(Array)
                    })
                })
            })
        })
    })

    it('should return error when token is missing', () => {
        return request(app)
        .get('/retrieve_list')
        .send({
            "authentication": {
            },
            "list_name": 'test_list',
            "direction_to_read_list": {"initial": {}},
            "number_of_sections_to_return": 1
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })
    it('should return error if direction_to_read_list is not provided', () => {
        return request(app)
        .get('/retrieve_list')
        .send({
            "authentication": {
                "token": g_access_token
            },
            "list_name": 'test_list',
            "number_of_sections_to_return": 1
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })
    it('should return error when number_of_sections_to_return is not provided and all parameters are valid', () => {
        return request(app)
        .get('/retrieve_list')
        .send({
            "authentication": {
                "token": g_access_token
            },
            "list_name": 'test_list',
            "direction_to_read_list": {"initial": {}}
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })
    it('should return error when list_name is not provided if all parameters are valid', () => {
        return request(app)
        .get('/retrieve_list')
        .send({
            "authentication": {
                "token": g_access_token
            },
            "direction_to_read_list": {"initial": {}},
            "number_of_sections_to_return": 1
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })
    it('should return error when list_name is found', () => {
        return request(app)
        .get('/retrieve_list')
        .send({
            "authentication": {
                "token": g_access_token
            },
            "list_name": 'test_list_xxxx',
            "direction_to_read_list": {"initial": {}},
            "number_of_sections_to_return": 1
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })
})