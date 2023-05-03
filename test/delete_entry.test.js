const request = require('supertest')
const server = require('../server')
const backend = require('../APIs/common/backend_json')
const root_dir = require('../APIs/common/find_root_dir').root_dir

const app = server.app
var g_access_token = null

describe('/DELETE delete_entry', () => {
    // setup the test
    beforeEach(() => {
        backend.setup_user_dir()
        backend.delete_all_users()
        const user_id = backend.get_user_id('test', 'test')
        backend.update_session(user_id, 'test', 'test_refresh_token')
        const access_token = backend.get_access_token(user_id)
        g_access_token = access_token
    })

    it('should delete an entry from a list', () => {
        return request(app)
        .post('/create_new_list')
        .send({
            "list_name": 'test_list'
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect(200)
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
                .delete('/delete_entry')
                .query({
                    "entry_id": '1'
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + g_access_token)
                .expect('Content-Type', /json/)
                .expect(200)
            })
        })
    })
    it('should not delete an entry from a list if the list does not exist', () => {
        return request(app)
        .post('/create_new_list')
        .send({
            "list_name": 'test_list'
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect(200)
        .then(function() {
            return request(app)
                .post('/add_new_item_to_list')
                .send({
                    "list_name": 'test_list',
                    "entry_name": 'new_entry_name'
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + g_access_token)
                .expect(200)
                .then(function() {
                    return request(app)
                    .delete('/delete_entry')
                    .query({
                        "entry_id": '111111'
                    })
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + g_access_token)
                    .expect('Content-Type', /json/)
                    .expect(400)
                })
        })
    })
})