/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

function Address() {
    const AddressSchema = new Schema({
        line1: String,
        line2: String,
        city: String,
        state: String,
        postcode: String,
        country: String,
        'created-on': Date
    }, {
        _id: false
    });

    // prior to save do this
    AddressSchema.pre('save', function(next) {
        if (!_.isDate(this['created-on'])) {
            this['created-on'] = moment();
        }
        next();
    });

    return mongoose.model('Address', AddressSchema);
}

module.exports = new Address();
