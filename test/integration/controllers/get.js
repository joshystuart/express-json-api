import q from 'q';
import app from '../app';
import should from 'should';
import request from 'supertest';
import db from '../../utils/db';
import logger from '../../../src/utils/logger';

import User from '../../models/user';
import Admin from '../../models/admin';
import Company from '../../models/company';

import users from '../../fixtures/users.json';
import admins from '../../fixtures/admins.json';
import companies from '../../fixtures/companies.json';

describe('Integration Tests', function() {
    describe('Controllers', function() {
        describe('Get', function() {
            before(function(done) {
                db.connect().
                then(function() {
                    return q.all([
                        db.import(User, users),
                        db.import(Admin, admins),
                        db.import(Company, companies)
                    ]);
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
