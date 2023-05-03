const request = require('supertest')
const server = require('../server')
const backend = require('../APIs/common/backend_json')
const root_dir = require('../APIs/common/find_root_dir').root_dir
const create_list = require('./retrieve_list.test').create_list

const app = server.app
var g_access_token = null

describe('/POST add_to_list', () => {
    // setup the test
    beforeEach(() => {
        backend.setup_user_dir()
        backend.delete_all_users()
        const user_id = backend.get_user_id('test', 'test')
        backend.update_session(user_id, 'test', 'test_refresh_token')
        const access_token = backend.get_access_token(user_id)
        g_access_token = access_token
    })

    it('should add an item to a list', () => {
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
            .expect('Content-Type', /json/)
            .expect(200)
        })
    })

    it('should not add an item to a list that does not exist', (done) => {
        request(app)
        .post('/add_new_item_to_list')
        .query({
            "list_name": 'test_list_xxxx',
            "entry_name": 'test_entry'
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function() {
            done()
        })
    })

    it('should not add an item to a list without a list name', (done) => {
        request(app)
        .post('/add_new_item_to_list')
        .query({
            "entry_name": 'test_entry'
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function() {
            done()
        })
    })

    it('should not add an item to a list without an entry name', (done) => {
        request(app)
        .post('/add_new_item_to_list')
        .query({
            "list_name": 'test_list'
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + g_access_token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function() {
            done()
        })
    })

    it('should not add an item to a list without an authentication token', (done) => {
        request(app)
        .post('/add_new_item_to_list')
        .query({
            "list_name": 'test_list',
            "entry_name": 'test_entry'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function() {
            done()
        })
    })
})