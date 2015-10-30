require('babel/register');
require('should');
const app = require('../app');
const request = require('supertest');
const db = require('../../utils/db');
const users = require('../../fixtures/users.json');
const User = require('../../models/user');
const logger = require('../../../src/utils/logger');

describe('Integration - Controllers - Get-list', function() {
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

    it('should filter by field parameter', function(done) {
        request(app.getExpressApplication()).
            get('/users/?filter[username]=elonmusk').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.data.length.should.be.exactly(1);
                res.body.data[0].name.first.should.be.exactly('Elon');
                res.body.data[0].name.last.should.be.exactly('Musk');
                done();
            });
    });

    it('should sort in ascending order by field', function(done) {
        request(app.getExpressApplication()).
            get('/users?sort=last-name').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.data.length.should.be.exactly(5);
                res.body.data[0].name.last.should.be.exactly('Armstrong');
                res.body.data[4].name.last.should.be.exactly('Zuckerberg');
                done();
            });
    });

    it('should sort in descending order by field ', function(done) {
        request(app.getExpressApplication()).
            get('/users?sort=-first-name').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.data.length.should.be.exactly(5);
                res.body.data[0].name.first.should.be.exactly('Sergey');
                res.body.data[4].name.first.should.be.exactly('Ada');
                done();
            });
    });

    it('should get all records', function(done) {
        request(app.getExpressApplication()).
            get('/users').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.data.length.should.be.exactly(5);
                res.body.meta.should.have.ownProperty('page');
                done();
            });
    });

    it('should search by configured fields', function(done) {
        request(app.getExpressApplication()).
            get('/users?q=Elon').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.data.length.should.be.exactly(1);
                res.body.data[0].name.first.should.be.exactly('Elon');
                res.body.data[0].name.last.should.be.exactly('Musk');
                done();
            });
    });

    it('should paginate by limit & offset parameters', function(done) {
        request(app.getExpressApplication()).
            get('/users?page[limit]=1&page[offset]=3').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.data.length.should.be.exactly(1);
                res.body.data[0].name.first.should.be.exactly('Neil');
                res.body.data[0].name.last.should.be.exactly('Armstrong');
                done();
            });
    });

    it('should not search by unspecified fields', function(done) {
        request(app.getExpressApplication()).
            get('/users?q=Musk').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.data.length.should.be.exactly(0);
                done();
            });
    });
});
