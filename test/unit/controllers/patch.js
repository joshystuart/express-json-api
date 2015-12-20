const sinon = require('sinon');
const db = require('../../utils/db');
const User = require('../../models/user');
const users = require('../../fixtures/users.json');
const patchController = require('../../../src/controllers/patch');

describe('Unit Tests', function() {
    describe('Controllers', function() {
        describe('Patch', function() {
            before(function(done) {
                db.connect().
                then(function() {
                    return db.import(User, users);
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

            it('should `validate` with correct params then call next()', function(done) {
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

                patchController.validate(req, res, next);
                const calledWithoutErrors = next.calledWith();

                next.calledOnce.should.be.equal(true);
                calledWithoutErrors.should.be.equal(true);
                done();
            });

            it('should `validate` with missing data.attributes then call next(err)', function(done) {
                const req = {
                    body: {
                        data: {
                            id: 1
                        }
                    }
                };

                const res = {};
                const next = sinon.spy();

                patchController.validate(req, res, next);

                const calledWithErrors = next.calledWithMatch(function(err) {
                    return typeof(err) !== 'undefined' && err.status === 400;
                });

                next.calledOnce.should.be.equal(true);
                calledWithErrors.should.be.equal(true);
                done();
            });

            it('should `validate` with missing data.id then call next(err)', function(done) {
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

                patchController.validate(req, res, next);

                const calledWithErrors = next.calledWithMatch(function(err) {
                    return typeof(err) !== 'undefined' && err.status === 400;
                });

                next.calledOnce.should.be.equal(true);
                calledWithErrors.should.be.equal(true);
                done();
            });

            it('should `find` then call next() and pass results', function(done) {
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
                const next = function() {
                    res.locals.resource.username.should.be.equal('sergeybrin');
                    done();
                };

                patchController.find(req, res, next);
            });

            it('should `update` then update existing record and pass results', function(done) {
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
                query.exec(function(err, user) {
                    res.locals.resource = user;

                    const next = function() {
                        res.locals.resource['first-name'].should.be.equal('Arnold');
                        done();
                    };

                    patchController.update(req, res, next);
                });
            });

            it('should `serialize` then transform response', function(done) {
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
                            serialize: function(model) {
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

                const next = function() {
                    const resource = res.locals.resource;
                    resource.name.first.should.be.equal('Neil');
                    resource.name.last.should.be.equal('Armstrong');
                    done();
                };

                patchController.serialize(req, res, next);
            });

            it('should `render` then return response object in json', function(done) {
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
                    json: function(response) {
                        response.meta.page.total.should.be.equal(1);
                        response.data.username.should.be.equal('neilastronaut');
                        done();
                    }
                };
                const next = function() {
                };

                patchController.render(req, res, next);
            });
        });
    });
});
