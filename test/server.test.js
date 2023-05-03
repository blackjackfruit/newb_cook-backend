const request = require('supertest')
const server = require('../server')
const backend = require('../APIs/common/backend_json')
const root_dir = require('../APIs/common/find_root_dir').root_dir

const app = server.app

describe('POST Login requirements', () => {
        beforeEach(() => {
                backend.setup_user_dir()
                backend.delete_all_users()
        })

        it('no username and password returns failure', () => {
                return request(app)
                .post('/login')
                .send({})
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401)
        })
        it('no password with valid user returns failure', () => {
                return request(app)
                .post('/login')
                .send({username: "test"})
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401)
        })
        it('no password with no valid user returns failure', () => {
                return request(app)
                .post('/login')
                .send({username: "testABCD"})
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401)
        })
        it('no username returns failure', () => {
                return request(app)
                .post('/login')
                .send({password: "test"})
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401)
        })
        it('when username and password are valid', () => {
                return request(app)
                .post('/login')
                .send({username: "test", password: "test"})
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                        expect(response.body).toEqual({
                                "response": {
                                        "refresh_token": expect.any(String),
                                        "token": expect.any(String)
                                }
                        })
                })
        })
})