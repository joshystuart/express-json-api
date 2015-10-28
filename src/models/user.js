/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
var _ = require('lodash');
var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

function User() {
    var UserSchema = new Schema({
        username: String,
        'first-name': String,
        'last-name': String,
        'created-on': Date
    });

    // prior to save do this
    UserSchema.pre('save', function(next) {
        if (!_.isDate(this['created-on'])) {
            this['created-on'] = moment();
        }
        next();
    });

    UserSchema.methods.getFullName = function() {
        return this['first-name'] + ' ' + this['last-name'];
    };

    return mongoose.model('User', UserSchema);
}

module.exports = new User();
