const should = require('should');
const q = require('q');
const app = require('../app');
const request = require('supertest');
const db = require('../../utils/db');
const admins = require('../../fixtures/admins.json');
const users = require('../../fixtures/users.json');
const companies = require('../../fixtures/companies.json');
const Admin = require('../../models/admin');
const User = require('../../models/user');
const Company = require('../../models/company');
const logger = require('../../../src/utils/logger');

describe('Integration Tests', function() {
    describe('Controllers', function() {
        describe('Get', function() {
            before(function(done) {
                db.connect().
                then(function() {
                    return db.import(User, users);
                }).
                then(function() {
                    return db.import(Admin, admins);
                }).
                then(function() {
                    return db.import(Company, companies);
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
                q.all([
                    db.removeAll(User),
                    db.removeAll(Admin),
                    db.removeAll(Company),
                ]).
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

            it('should get a single user', function(done) {
                request(app.getExpressApplication()).
                get('/users/562d8ac45e5d77d80c478065').
                set('Content-Type', 'application/json').
                expect(200).
                end(function(err, res) {
                    should.not.exist(err);

                    res.body.meta.should.have.ownProperty('page');
                    res.body.meta.page.total.should.be.exactly(1);
                    res.body.meta.page.offset.should.be.exactly(1);
                    res.body.meta.page.limit.should.be.exactly(1);

                    // serialized data
                    res.body.data.name.first.should.be.exactly('Sergey');
                    res.body.data.name.last.should.be.exactly('Brin');
                    done();
                });
            });

            it('should return a 404 when a single user not found', function(done) {
                request(app.getExpressApplication()).
                get('/users/562d8ac45e5d77d80c478066').
                set('Content-Type', 'application/json').
                expect(404).
                end(function(err) {
                    should.not.exist(err);
                    done();
                });
            });
        });
    });
});
