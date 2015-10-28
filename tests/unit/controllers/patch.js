require('babel/register');
const sinon = require('sinon');
const db = require('../../utils/db');
const User = require('../../models/user');
const users = require('../../fixtures/users.json');
const patchController = require('../../../src/controllers/patch');

describe('Unit - Controllers - Patch', function() {
    before(function(done) {
        db.connect().
            then(function() {
                db.import(User, users);
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

    it('`validate` with correct params should call next()', function(done) {
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
        next.calledOnce.should.be.equal(true);
        done();
    });

    it('`validate` with missing data.attributes should call next(err)', function(done) {
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

    it('`validate` with missing data.id should call next(err)', function(done) {
        const req = {
            body: {
                data: {
                    attributes: {
                        'last-name': 'Little'
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

    it('`find` should call next() and pass results', function(done) {
        const req = {
            id: '_id',
            body: {
                data: {
                    id: users[0]._id
                }
            }
        };

        const res = {
            locals: {
                target: User
            }
        };
        const next = function() {
            res.locals.resource.username.should.be.equal('neilastronaut');
            done();
        };

        patchController.find(req, res, next);
    });

    it('`update` should update existing record and pass results', function(done) {
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

    it('`serialize` should transform response', function(done) {
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
                        return  {
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

    it('`render` should return response object in json', function(done) {
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
        const next = function() {};

        patchController.render(req, res, next);
    });
});
