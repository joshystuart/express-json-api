import _ from 'lodash';
import mongoose from 'mongoose';
import moment from 'moment';

const Schema = mongoose.Schema;

function Company() {
    const CompanySchema = new Schema({
        name: String,
        'legal-name': String,
        'created-on': Date
    }, {
        collection: 'companies'
    });

    // prior to save do this
    CompanySchema.pre('save', function(next) {
        if (!_.isDate(this['created-on'])) {
            this['created-on'] = moment();
        }
        next();
    });

    return mongoose.model('company', CompanySchema);
}

module.exports = new Company();
