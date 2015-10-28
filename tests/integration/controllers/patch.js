require('babel/register');
require('should');
const app = require('../app');
const request = require('supertest');
const db = require('../../utils/db');
const users = require('../../fixtures/users.json');
const User = require('../../models/user');

describe('Integration - Controllers - Patch', function() {
    before(function(done) {
        db.connect().
            then(function() {
                db.import(User, users);
            }).
            then(function() {
                app.init();
            }).
            then(function() {
                done();
            });
    });

    after(function(done) {
        db.removeAll(User).
            then(function() {
                db.disconnect();
                done();
            });
    });

    it('patch request should update existing database record', function(done) {
        const id = users[0]._id;
        const updates = {
            'data': {
                'id': '563032c37b150fa861740028',
                'attributes': {
                    'last-name': 'Lovegood'
                }
            }
        };

        request(app.getExpressApplication()).
            patch('/users/' + id).
            set('Content-Type', 'application/json').
            send(updates).
            expect(function(res) {
                // data response has been transformed by serializer
                res.body.data.name.last.should.be.equal('Lovegood');
                res.body.data.name.first.should.be.equal('Ada');
            }).
            expect(200, done);
    });

    it('patch request should return HTTP 404 on non-existing record', function(done) {
        const id = users[0]._id;
        const updates = {
            'data': {
                'id': '5630743e2446a0672a4ee793',
                'attributes': {
                    'last-name': 'this should fail'
                }
            }
        };

        request(app.getExpressApplication()).
            patch('/users/' + id).
            set('Content-Type', 'application/json').
            send(updates).
            expect(404, done);
    });

    it('patch request should return HTTP 400 if `attributes` is missing', function(done) {
        const id = users[0]._id;
        const updates = {
            'data': {
                'id': '563032c37b150fa86174002A'
            }
        };

        request(app.getExpressApplication()).
            patch('/users/' + id).
            set('Content-Type', 'application/json').
            send(updates).
            expect(400, done);
    });

    it('patch request should return HTTP 400 if `id` is missing', function(done) {
        const id = users[0]._id;
        const updates = {
            'data': {
                'attributes': {
                    'last-name': 'this should fail'
                }
            }
        };

        request(app.getExpressApplication()).
            patch('/users/' + id).
            set('Content-Type', 'application/json').
            send(updates).
            expect(400, done);
    });
});
