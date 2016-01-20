import filters from 'xss-filters';
import _ from 'lodash';

export default {
    sanitize: function(attribute) {
        if (_.isObject(attribute) && !_.isNull(attribute)) {
            if (_.isArray(attribute)) {
                attribute.forEach(function(index) {
                    attribute[index] = filters.inHTMLData(attribute[index]);
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
