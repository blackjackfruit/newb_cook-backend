const request = require('supertest')
const server = require('../server')
const backend = require('../APIs/common/backend_json')
const { encode_jwt } = require('../APIs/common/jwt_helper')

const SECRET = 'SECRET'
const app = server.app
const OLD_ACCESS_TOKEN = encode_jwt(1, SECRET, 1)
const OLD_REFRESH_TOKEN = encode_jwt(1, SECRET, 2)
var g_access_token = null

describe('/POST return_remaining_lists_after_removal_of_list_name', () => {
    // setup the test
    beforeEach(() => {
        backend.setup_user_dir()
        backend.delete_all_users()
        const user_id = backend.get_user_id('test', 'test')
        backend.update_session(user_id, OLD_ACCESS_TOKEN, OLD_REFRESH_TOKEN)
        const access_token = backend.get_access_token(user_id)
        g_access_token = access_token
    })

    it('should return reminaing list after deleting list name', () => {
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
                .post('/return_remaining_lists_after_removal_of_list_name')
                .send({
                    'list_name': 'test_list1'
                })
                .set('Authorization', 'Bearer ' + g_access_token)
                .expect(200)
            })
        })
    })

    // it('should return 400 if list name is not provided', () => {
    //     return request(app)
    //     .post('/return_remaining_lists_after_removal_of_list_name')
    //     .send({
    //         'authentication': {
    //             'token': g_access_token
    //         }
    //     })
    //     .set('Accept', 'application/json')
    //     .expect(400)
    // })

    // it('should return error if authentication is not provided', () => {
    //     return request(app)
    //     .post('/return_remaining_lists_after_removal_of_list_name')
    //     .send({
    //         'list_name': 'test_list'
    //     })
    //     .set('Accept', 'application/json')
    //     .expect(500)
    // })

    // it('should return error if token is not provided', () => {
    //     return request(app)
    //     .post('/return_remaining_lists_after_removal_of_list_name')
    //     .send({
    //         'authentication': {
    //         },
    //         'list_name': 'test_list'
    //     })
    //     .set('Accept', 'application/json')
    //     .expect(400)
    // })
})