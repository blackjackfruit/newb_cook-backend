const request = require('supertest')
const server = require('../server')
const backend = require('../APIs/common/backend_json')
const { encode_jwt } = require('../APIs/common/jwt_helper')

const app = server.app
var g_access_token = null
const SECRET = 'SECRET'
const OLD_ACCESS_TOKEN = encode_jwt(1, SECRET, 1)
const OLD_REFRESH_TOKEN = encode_jwt(1, SECRET, 2)

describe('/POST update_list_entry_values', () => {
    // setup the test
    beforeAll(() => {
        backend.setup_user_dir()
        backend.delete_all_users()
        const user_id = backend.get_user_id('test', 'test')
        backend.update_session(user_id, OLD_ACCESS_TOKEN, OLD_REFRESH_TOKEN)
        const access_token = backend.get_access_token(user_id)
        g_access_token = access_token
    })
    
    it('should update list entry name', () => {
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
                .patch('/update_list_entry_values')
                .query({
                    'list_id': 1,
                    'list_name': 'test_list',
                    'entry_id': 1,
                    'entry_name': 'new_test_entry',
                    'entry_is_check_marked': false
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + g_access_token)
                .expect(200)
            })
        })
    })

    it('should update list entry name even when list_id and entry_id are strings', () => {
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
                .patch('/update_list_entry_values')
                .query({
                    'list_id': '1',
                    'list_name': 'test_list',
                    'entry_id': '1',
                    'entry_name': 'new_test_entry',
                    'entry_is_check_marked': false
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + g_access_token)
                .expect(200)
            })
        })
    })

    it('should return error if list_id is null', () => {
        return request(app)
        .patch('/update_list_entry_values')
        .query({
            'list_name': 'test_list',
            'entry_id': '1',
            'entry_name': 'new_test_entry',
            'entry_is_check_marked': false
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect(400)
    })

    it('should return error if list_name is null', () => {
        return request(app)
        .patch('/update_list_entry_values')
        .query({
            'list_id': '1',
            'entry_id': '1',
            'entry_name': 'new_test_entry',
            'entry_is_check_marked': false
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect(400)
    })

    it('should return error if entry_id is null', () => {
        return request(app)
        .patch('/update_list_entry_values')
        .query({
            'list_id': '1',
            'list_name': 'test_list',
            'entry_name': 'new_test_entry',
            'entry_is_check_marked': false
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect(400)
    })

    it('should return error if entry_name is null', () => {
        return request(app)
        .patch('/update_list_entry_values')
        .query({
            'list_id': '1',
            'list_name': 'test_list',
            'entry_id': '1',
            'entry_is_check_marked': false
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect(400)
    })

    it('should return error if authentication is null', () => {
        return request(app)
        .patch('/update_list_entry_values')
        .query({
            'list_id': '1',
            'list_name': 'test_list',
            'entry_id': '1',
            'entry_name': 'new_test_entry',
            'entry_is_check_marked': false
        })
        .set('Accept', 'application/json')
        .expect(400)
    })

    it('should return error if entry_is_check_marked is null', () => {
        return request(app)
        .patch('/update_list_entry_values')
        .query({
            'list_id': '1',
            'list_name': 'test_list',
            'entry_id': '1',
            'entry_name': 'new_test_entry'
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect(400)
    })
})