const request = require('supertest')
const server = require('../server')
const backend = require('../APIs/common/backend_json')
const root_dir = require('../APIs/common/find_root_dir').root_dir
const { encode_jwt } = require('../APIs/common/jwt_helper')

const app = server.app
var g_access_token = null

const SECRET = 'SECRET'
var OLD_ACCESS_TOKEN = encode_jwt(1, SECRET, 1)
var OLD_REFRESH_TOKEN = encode_jwt(1, SECRET, 2)

describe('/POST find_items_for_user', () => {
    // setup the test
    beforeEach(() => {
        backend.setup_user_dir()
        backend.delete_all_users()
        const user_id = backend.get_user_id('test', 'test')
        backend.update_session(user_id, OLD_ACCESS_TOKEN, OLD_REFRESH_TOKEN)
        const access_token = backend.get_access_token(user_id)
        g_access_token = access_token
    })
    
    it('should find items for a user', () => {
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
            .then(function() {
                return request(app)
                .get('/find_items_for_user')
                .query({
                    "list_name": "test_list",
                    "search_request": "test"
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + g_access_token)
                .expect(200)
                .then((response) => {
                    expect(Array.isArray(response.body.response)).toBeTruthy()
                    expect(response.body.response.length).toEqual(1)
                })
            })
        })
    })

    it('should return error if search_request is null', () => {
        return request(app)
        .get('/find_items_for_user')
        .query({
            "list_name": "test_list"
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect(400)
    })

    it('should return error if list_name is null', () => {
        return request(app)
        .get('/find_items_for_user')
        .query({
            "search_request": "test"
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect(400)
    })

    it('should return error if authorization is not available', () => {
        return request(app)
        .get('/find_items_for_user')
        .query({
            "list_name": "test_list",
            "search_request": "test"
        })
        .set('Accept', 'application/json')
        .expect(400)
    })
})