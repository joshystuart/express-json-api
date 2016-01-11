/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

import _ from 'lodash';
import AbstractController from './abstract-controller.js';

/**
 * An abstract controller for creating (POST) and updating (PATCH, PUT) controllers.
 */
class AbstractCreateController extends AbstractController {
    /**
     * Sanitize the input to ensure the data submitted does is escaped correctly.
     *
     * This allows for a custom sanitizer, but also falls back to a default xss sanitizer.
     *
     * @param req
     * @param res
     * @param next
     */
    static sanitize(req, res, next) {
        const options = res.locals.sanitize;
        let sanitizer = options.method;
        const updates = req.body.data.attributes;

        if (typeof(sanitizer) === 'undefined') {
            sanitizer = require('../utils/sanitizer');
        }

        if (options.active && typeof(options.fields) === 'undefined') {
            // sanitize all fields
            _.forEach(_.keys(updates), function(field) {
                updates[field] = sanitizer.sanitize(updates[field]);
            });
        } else if (options.active && options.fields.constructor === Array) {
            // sanitize selected fields
            _.forEach(_.keys(updates), function(field) {
                if (options.fields.indexOf(field) > -1) {
                    updates[field] = sanitizer.sanitize(updates[field]);
                }
            });
        }

        req.body.data.attributes = updates;
        next();
    }
}

export default AbstractCreateController;
