require('should');
const sinon = require('sinon');
const db = require('../../utils/db');
const User = require('../../models/user');
const post = require('../../../src/controllers/post-controller');

describe('Unit Tests', function() {
    describe('Controllers', function() {
        describe('Post', function() {
            before(function(done) {
                db.connect().
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
                            attributes: {
                                'first-name': 'Arnold'
                            }
                        }
                    }
                };

                const res = {};
                const next = sinon.spy();

                post.validate(req, res, next);
                const calledWithoutErrors = next.calledWith();

                next.calledOnce.should.be.equal(true);
                calledWithoutErrors.should.be.equal(true);
                done();
            });

            it('should `validate` with missing data.attributes then call next(err)', function(done) {
                const req = {
                    body: {
                        data: {}
                    }
                };

                const res = {};
                const next = sinon.spy();

                post.validate(req, res, next);

                const calledWithErrors = next.calledWithMatch(function(err) {
                    return typeof(err) !== 'undefined' && err.status === 400;
                });

                next.calledOnce.should.be.equal(true);
                calledWithErrors.should.be.equal(true);
                done();
            });

            it('should `create` then insert a new record and pass results', function(done) {
                const req = {
                    body: {
                        data: {
                            attributes: {
                                'first-name': 'Arnold'
                            }
                        }
                    }
                };

                const res = {
                    locals: {
                        model: User
                    }
                };

                const next = function() {
                    res.locals.resource['first-name'].should.be.equal('Arnold');
                    done();
                };

                post.create(req, res, next);
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

                post.serialize(req, res, next);
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

                post.render(req, res, next);
            });
        });
    });
});
