require('babel/register');
const should = require('should');
const sinon = require('sinon');
const ObjectID = require('mongodb').ObjectID;
const db = require('../../utils/db');
const User = require('../../../src/models/user');
const users = require('../../fixtures/users.json');

describe('Unit - Controllers - Sample', function() {

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
            })
    });

    // tests 
    it('sample test', function(done) {
        done();
    });
});