import filters from 'xss-filters';
import _ from 'lodash';

const sanitize = (attribute) => {
    if (_.isObject(attribute) && !_.isNull(attribute)) {
        if (_.isArray(attribute)) {
            _.forEach(attribute, (value, index) => {
                attribute[index] = sanitize(value);
            });
        } else {
            _.forEach(_.keys(attribute), (key) => {
                attribute[key] = sanitize(attribute[key]);
            });
        }

        return attribute;
    }

    return filters.inHTMLData(attribute);
};

export default {
    sanitize: sanitize
};


