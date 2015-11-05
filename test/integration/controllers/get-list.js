const should = require('should');
const q = require('q');
const app = require('../app');
const request = require('supertest');
const db = require('../../utils/db');
const admins = require('../../fixtures/admins.json');
const users = require('../../fixtures/users.json');
const Admin = require('../../models/admin');
const User = require('../../models/user');
const logger = require('../../../src/utils/logger');

describe('Integration - Controllers - Get-list', function() {
    before(function(done) {
        db.connect().
            then(function() {
                return q.all([
                    db.import(User, users),
                    db.import(Admin, admins)
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
            db.removeAll(Admin)
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

    it('should get all user records', function(done) {
        request(app.getExpressApplication()).
            get('/users').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                should.not.exist(err);

                res.body.data.length.should.be.exactly(5);
                res.body.meta.should.have.ownProperty('page');
                done();
            });
    });

    it('should get only admin records', function(done) {
        request(app.getExpressApplication()).
            get('/admins').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                should.not.exist(err);

                res.body.data.length.should.be.exactly(1);

                res.body.data[0]['first-name'].should.be.exactly('Elon');
                res.body.data[0]['last-name'].should.be.exactly('Musk');
                res.body.meta.should.have.ownProperty('page');
                done();
            });
    });

    it('should filter by single field', function(done) {
        request(app.getExpressApplication()).
            get('/users?filter[username]=elonmusk').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                should.not.exist(err);

                res.body.data.length.should.be.exactly(1);
                res.body.data[0].name.first.should.be.exactly('Elon');
                res.body.data[0].name.last.should.be.exactly('Musk');
                done();
            });
    });

    it('should filter by single field with multiple values', function(done) {
        request(app.getExpressApplication()).
        get('/users?filter[username]=elonmusk,markzuckerberg').
        set('Content-Type', 'application/json').
        expect(200).
        end(function(err, res) {
            should.not.exist(err);

            res.body.data.length.should.be.exactly(2);
            res.body.data[0].name.first.should.be.exactly('Mark');
            res.body.data[0].name.last.should.be.exactly('Zuckerberg');
            res.body.data[1].name.first.should.be.exactly('Elon');
            res.body.data[1].name.last.should.be.exactly('Musk');
            done();
        });
    });

    it('should filter by multiple fields', function(done) {
        request(app.getExpressApplication()).
        get('/users?filter[first-name]=Elon&filter[last-name]=Musk').
        set('Content-Type', 'application/json').
        expect(200).
        end(function(err, res) {
            should.not.exist(err);

            res.body.data.length.should.be.exactly(1);
            res.body.data[0].name.first.should.be.exactly('Elon');
            res.body.data[0].name.last.should.be.exactly('Musk');
            done();
        });
    });

    it('should filter by multiple fields and not return a result', function(done) {
        request(app.getExpressApplication()).
        get('/users?filter[first-name]=Elon&filter[last-name]=Not').
        set('Content-Type', 'application/json').
        expect(200).
        end(function(err, res) {
            should.not.exist(err);

            res.body.data.length.should.be.exactly(0);
            done();
        });
    });

    it('should sort in ascending order by field', function(done) {
        request(app.getExpressApplication()).
            get('/users?sort=last-name').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                should.not.exist(err);

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
                should.not.exist(err);

                res.body.data.length.should.be.exactly(5);
                res.body.data[0].name.first.should.be.exactly('Sergey');
                res.body.data[4].name.first.should.be.exactly('Ada');
                done();
            });
    });

    it('should sort by sub document in ascending order', function(done) {
        request(app.getExpressApplication()).
            get('/users?sort=address.city').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                should.not.exist(err);

                res.body.data.length.should.be.exactly(5);
                res.body.data[0].name.last.should.be.exactly('Lovelace');
                res.body.data[3].name.last.should.be.exactly('Armstrong');
                done();
            });
    });

    it('should search by configured fields with full match', function(done) {
        request(app.getExpressApplication()).
            get('/users?q=Elon').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                should.not.exist(err);

                res.body.data.length.should.be.exactly(1);
                res.body.data[0].name.first.should.be.exactly('Elon');
                res.body.data[0].name.last.should.be.exactly('Musk');
                done();
            });
    });

    it('should search by configured fields with case insensitive partial match', function(done) {
        request(app.getExpressApplication()).
        get('/users?q=elo').
        set('Content-Type', 'application/json').
        expect(200).
        end(function(err, res) {
            should.not.exist(err);

            res.body.data.length.should.be.exactly(1);
            res.body.data[0].name.first.should.be.exactly('Elon');
            res.body.data[0].name.last.should.be.exactly('Musk');
            done();
        });
    });

    it('should search by configured fields with multiple terms', function(done) {
        request(app.getExpressApplication()).
        get('/users?q=elon+musk').
        set('Content-Type', 'application/json').
        expect(200).
        end(function(err, res) {
            should.not.exist(err);

            res.body.data.length.should.be.exactly(1);
            res.body.data[0].name.first.should.be.exactly('Elon');
            res.body.data[0].name.last.should.be.exactly('Musk');
            done();
        });
    });

    it('should sort and paginate by limit & offset parameters', function(done) {
        request(app.getExpressApplication()).
            get('/users?sort=first-name&page[limit]=1&page[offset]=3').
            set('Content-Type', 'application/json').
            expect(200).
            end(function(err, res) {
                should.not.exist(err);

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
                should.not.exist(err);

                res.body.data.length.should.be.exactly(0);
                done();
            });
    });
});
