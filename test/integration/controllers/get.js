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

describe('Integration Tests', () => {
    describe('Controllers', () => {
        describe('Get', () => {
            before((done) => {
                db.connect().
                then(() => {
                    return q.all([
                        db.import(User, users),
                        db.import(Admin, admins),
                        db.import(Company, companies)
                    ]);
                }).
                then(() => {
                    return app.init();
                }).
                then(() => {
                    done();
                }).
                fail((err) => {
                    logger.error(err);
                });
            });

            after((done) => {
                q.all([
                    db.removeAll(User),
                    db.removeAll(Admin),
                    db.removeAll(Company)
                ]).
                then(() => {
                    return app.stop();
                }).
                then(() => {
                    return db.disconnect();
                }).
                then(() => {
                    done();
                }).
                fail((err) => {
                    logger.error(err);
                });
            });

            it('should get a single user', (done) => {
                request(app.getExpressApplication()).
                get('/users/562d8ac45e5d77d80c478065').
                set('Content-Type', 'application/json').
                expect(200).
                end((err, res) => {
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

            it('should return a 404 when a single user not found', (done) => {
                request(app.getExpressApplication()).
                get('/users/562d8ac45e5d77d80c478066').
                set('Content-Type', 'application/json').
                expect(404).
                end((err) => {
                    should.not.exist(err);
                    done();
                });
            });
        });
    });
});
