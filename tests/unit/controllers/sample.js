require('babel/register');
const db = require('../../utils/db');
const User = require('../../models/user');
const users = require('../../fixtures/users.json');

xdescribe('Unit - Controllers - Sample', function() {
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

    it('sample test', function(done) {
        done();
    });
});
