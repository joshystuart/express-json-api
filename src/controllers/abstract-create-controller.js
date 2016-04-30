/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

import _ from 'lodash';
import AbstractController from './abstract-controller.js';
import defaultSanitizer from '../utils/sanitizer';

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
            sanitizer = defaultSanitizer;
        }

        if (options.active && typeof(options.fields) === 'undefined') {
            // sanitize all fields
            _.forEach(_.keys(updates), (field) => {
                updates[field] = sanitizer.sanitize(updates[field]);
            });
        } else if (options.active && options.fields.constructor === Array) {
            // sanitize selected fields
            _.forEach(_.keys(updates), (field) => {
                if (options.fields.indexOf(field) > -1) {
                    updates[field] = sanitizer.sanitize(updates[field]);
                }
            });
        }

        req.body.data.attributes = updates;
        next();
    }

    /**
     * Renders the model to the json response.
     *
     * @param req
     * @param res
     * @param next
     */
    static render(req, res, next) {
        const resource = res.locals.resource;

        if (typeof(resource) === 'undefined') {
            this.setException(500, `Nothing to render`, next);
        }
        // send the data back to the client
        res.json({
            meta: {
                page: {
                    total: 1,
                    offset: 1,
                    limit: 1
                }
            },
            data: resource
        });
    }
}

export default AbstractCreateController;
