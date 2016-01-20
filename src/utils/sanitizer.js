import filters from 'xss-filters';
import _ from 'lodash';

export default {
    sanitize: function(attribute) {
        if (_.isObject(attribute) && !_.isNull(attribute)) {
            if (_.isArray(attribute)) {
                _.forEach(attribute, function(value, index) {
                    attribute[index] = filters.inHTMLData(value);
                });
            } else {
                _.forEach(_.keys(attribute), function(key) {
                    attribute[key] = filters.inHTMLData(attribute[key]);
                });
            }

            return attribute;
        }

        return filters.inHTMLData(attribute);
    }
};
