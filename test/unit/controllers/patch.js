import 'should';
import sinon from 'sinon';
import db from '../../utils/db';
import User from '../../models/user';
import users from '../../fixtures/users.json';
import * as patch from '../../../src/controllers/patch-controller';

describe('Unit Tests', () => {
    describe('Controllers', () => {
        describe('Patch', () => {
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

            it('should `validate` with correct params then call next()', (done) => {
                const req = {
                    body: {
                        data: {
                            id: users[0]._id,
                            attributes: {
                                'last-name': 'Lovelace'
                            }
                        }
                    }
                };

                const res = {};
                const next = sinon.spy();

                patch.validate(req, res, next);
                const calledWithoutErrors = next.calledWith();

                next.calledOnce.should.be.equal(true);
                calledWithoutErrors.should.be.equal(true);
                done();
            });

            it('should `validate` with missing data.attributes then call next(err)', (done) => {
                const req = {
                    body: {
                        data: {
                            id: 1
                        }
                    }
                };

                const res = {};
                const next = sinon.spy();

                patch.validate(req, res, next);

                const calledWithErrors = next.calledWithMatch((err) => {
                    return typeof(err) !== 'undefined' && err.status === 400;
                });

                next.calledOnce.should.be.equal(true);
                calledWithErrors.should.be.equal(true);
                done();
            });

            it('should `validate` with missing data.id then call next(err)', (done) => {
                const req = {
                    body: {
                        data: {
                            attributes: {
                                missing: 'stuff'
                            }
                        }
                    }
                };

                const res = {};
                const next = sinon.spy();

                patch.validate(req, res, next);

                const calledWithErrors = next.calledWithMatch((err) => {
                    return typeof(err) !== 'undefined' && err.status === 400;
                });

                next.calledOnce.should.be.equal(true);
                calledWithErrors.should.be.equal(true);
                done();
            });

            it('should `find` then call next() and pass results', (done) => {
                const req = {
                    params: {
                        _id: users[0]._id
                    },
                    body: {
                        data: {
                            id: users[0]._id,
                            attributes: {
                                'last-name': 'Brin'
                            }
                        }
                    }
                };

                const res = {
                    locals: {
                        id: '_id',
                        model: User
                    }
                };
                const next = () => {
                    res.locals.resource.username.should.be.equal('sergeybrin');
                    done();
                };

                patch.find(req, res, next);
            });

            it('should `update` then update existing record and pass results', (done) => {
                const req = {
                    body: {
                        data: {
                            id: users[0]._id,
                            attributes: {
                                'first-name': 'Arnold'
                            }
                        }
                    }
                };

                const res = {
                    locals: {}
                };

                const query = User.findOne({_id: users[0]._id});
                query.exec((err, user) => {
                    res.locals.resource = user;

                    const next = () => {
                        res.locals.resource['first-name'].should.be.equal('Arnold');
                        done();
                    };

                    patch.update(req, res, next);
                });
            });

            it('should `serialize` then transform response', (done) => {
                const req = {};
                const res = {
                    locals: {
                        resource: {
                            'last-name': 'Armstrong',
                            'first-name': 'Neil',
                            username: 'neilastronaut',
                            'created-on': 'Wed Oct 28 2015 02:08:51 GMT+0000 (UTC)',
                            _id: '562f20dae5170edf1ca31b0f'
                        },
                        mapper: {
                            serialize: (model) => {
                                return {
                                    name: {
                                        first: model['first-name'],
                                        last: model['last-name']
                                    },
                                    username: model.username,
                                    meta: {
                                        id: model._id,
                                        'created-on': model['created-on']
                                    }
                                };
                            }
                        }
                    }
                };

                const next = () => {
                    const resource = res.locals.resource;
                    resource.name.first.should.be.equal('Neil');
                    resource.name.last.should.be.equal('Armstrong');
                    done();
                };

                patch.serialize(req, res, next);
            });

            it('should `render` then return response object in json', (done) => {
                const req = {};
                const res = {
                    locals: {
                        resource: {
                            'last-name': 'Armstrong',
                            'first-name': 'Neil',
                            username: 'neilastronaut',
                            'created-on': 'Wed Oct 28 2015 02:08:51 GMT+0000 (UTC)',
                            _id: '562f20dae5170edf1ca31b0f'
                        }
                    },
                    json: (response) => {
                        response.meta.page.total.should.be.equal(1);
                        response.data.username.should.be.equal('neilastronaut');
                        done();
                    }
                };
                const next = () => {
                };

                patch.render(req, res, next);
            });
        });
    });
});
