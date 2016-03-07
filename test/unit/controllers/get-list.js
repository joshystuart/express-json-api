import 'should';
import sinon from 'sinon';
import db from '../../utils/db';
import User from '../../models/user';
import users from '../../fixtures/users.json';
import * as getList from '../../../src/controllers/get-list-controller';

describe('Unit Tests', () => {
    describe('Controllers', () => {
        describe('Get-list', () => {
            before((done) => {
                db.connect().
                then(() => {
                    return db.import(User, users);
                }).
                then(() => {
                    done();
                });
            });

            after((done) => {
                db.removeAll(User).
                then(() => {
                    db.disconnect();
                    done();
                });
            });

            it('should create `search` criteria then call next()', (done) => {
                const req = {
                    query: {
                        q: 'Elon'
                    }
                };

                const res = {
                    locals: {
                        search: {
                            active: true,
                            fields: ['first-name']
                        },
                        model: User,
                        criteria: {}
                    }
                };
                const next = sinon.spy();

                getList.search(req, res, next);
                next.calledOnce.should.be.equal(true);
                done();
            });

            it('should create `query` then call next() ', (done) => {
                const req = {};
                const res = {
                    locals: {
                        model: User
                    }
                };
                const next = sinon.spy();

                getList.query(req, res, next);
                next.calledOnce.should.be.equal(true);
                done();
            });

            it('should `filter` then call next() ', (done) => {
                const req = {
                    query: {
                        filter: 'first-name'
                    }
                };
                const res = {
                    locals: {
                        model: User
                    }
                };
                const next = sinon.spy();

                getList.filter(req, res, next);
                next.calledOnce.should.be.equal(true);
                done();
            });

            it('should `sort` then call next() ', (done) => {
                const req = {
                    query: {
                        sort: 'first-name'
                    }
                };
                const res = {
                    locals: {
                        model: User,
                        query: User.find({})
                    }
                };
                const next = sinon.spy();

                getList.sort(req, res, next);
                next.calledOnce.should.be.equal(true);
                done();
            });

            it('should create `page` then call next() ', (done) => {
                const total = 100;
                const req = {
                    query: {
                        page: {
                            limit: 20,
                            offset: 10
                        }
                    }
                };
                const res = {
                    locals: {
                        model: User,
                        query: {
                            count: (cb) => {
                                cb(null, total);
                            },
                            skip: function() {
                                return this;
                            },
                            limit: function() {
                                return this;
                            }
                        }
                    }
                };
                const next = sinon.spy();

                getList.page(req, res, next);
                next.calledOnce.should.be.equal(true);
                res.locals.page.total.should.be.equal(total);
                res.locals.page.limit.should.be.equal(req.query.page.limit);
                res.locals.page.offset.should.be.equal(req.query.page.offset);
                done();
            });

            it('should `render` response object in json ', (done) => {
                const req = {};
                const res = {
                    locals: {
                        page: {
                            total: 1
                        },
                        resources: users[0]
                    },
                    json: (response) => {
                        response.meta.page.total.should.be.equal(1);
                        response.data.username.should.be.equal('sergeybrin');
                        done();
                    }
                };
                const next = () => {
                };

                getList.render(req, res, next);
            });
        });
    });
});
