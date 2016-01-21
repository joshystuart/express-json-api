/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import _ from 'lodash';
import mongoose from 'mongoose';
import moment from 'moment';
import Address from './address';
const Schema = mongoose.Schema;

function User() {
    const UserSchema = new Schema({
        username: String,
        'first-name': String,
        'last-name': String,
        company: {
            type: Schema.Types.ObjectId,
            ref: 'company'
        },
        address: {type: Address.schema},
        addresses: [Address.schema],
        'created-on': Date,
        active: Boolean,
        age: Number
    }, {
        collection: 'users',
        discriminatorKey: 'role'
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
