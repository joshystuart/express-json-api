require('babel/register');
require('should');
const app = require('../app');
const request = require('supertest');
const db = require('../../utils/db');
const users = require('../../fixtures/users.json');
const User = require('../../models/user');
const logger = require('../../../src/utils/logger');

describe('Integration - Controllers - Patch', function() {
    before(function(done) {
        db.connect().
            then(function() {
                return db.import(User, users);
            }).
            then(function() {
                return app.init();
            }).
            then(function() {
                done();
            }).
            fail(function(err) {
                logger.error(err);
            });
    });

    after(function(done) {
        db.removeAll(User).
            then(function() {
                return app.stop();
            }).
            then(function() {
                return db.disconnect();
            }).
            then(function() {
                done();
            }).
            fail(function(err) {
                logger.error(err);
            });
    });

    it('should update an existing database record', function(done) {
        const id = users[4]._id;
        const updates = {
            data: {
                id: id,
                attributes: {
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

    it('should return http 404 when updating a missing record', function(done) {
        const id = '5630743e2446a0672a4ee793';
        const updates = {
            data: {
                id: id,
                attributes: {
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

    it('should return http 400 if `attributes` are missing', function(done) {
        const id = users[0]._id;
        const updates = {
            data: {
                id: id,
                meta: {
                    stuff: 'this should fail'
                }
            }
        };

        request(app.getExpressApplication()).
            patch('/users/' + id).
            set('Content-Type', 'application/json').
            send(updates).
            expect(400, done);
    });

    it('should return http 400 if `id` is missing', function(done) {
        const id = users[0]._id;
        const updates = {
            data: {
                meta: {
                    stuff: 'this should fail'
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
