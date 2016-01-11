/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

import _ from 'lodash';
import AbstractCreateController from './abstract-create-controller.js';
import logger from '../utils/logger.js';

class PatchController extends AbstractCreateController {
    static validate(req, res, next) {
        // TODO add check for req.body.type as per jsonapi.org requirements.
        if (!!req.body.data && !!req.body.data.id && !!req.body.data.attributes) {
            next();
        } else {
            super.setException(400, 'Request failed validation', next);
        }
    }

    /**
     * Finds the resource based on the id and model registered to the route.
     *
     * @param req
     * @param res
     * @param next
     */
    static find(req, res, next) {
        // get the resource if from the route
        const id = req.params[res.locals.id];
        const model = res.locals.model;
        const criteria = {};

        if (!!model) {
            criteria[res.locals.id] = id;
            const query = model.findOne(criteria);

            logger.info('Finding resource by ' + res.locals.id + ' = ' + id);

            query.exec(function(err, result) {
                if (err) {
                    super.setException(500, err.toString(), next);
                } else if (!result) {
                    super.setException(404, 'Record not found', next);
                } else {
                    res.locals.resource = result;
                    next();
                }
            });
        } else {
            super.setModelNotFoundException(next);
        }
    }

    /**
     * Updates the found model with the passed data. Since this is a patch, it is a merge, rather than a replace.
     *
     * @param req
     * @param res
     * @param next
     */
    static update(req, res, next) {
        const updates = req.body.data.attributes;
        const resource = res.locals.resource;

        if (!!resource) {
            const updatedResource = _.merge(resource, updates);

            updatedResource.save(function(error) {
                if (error) {
                    this.setException(404, 'Error on model save: ' + err.toString(), next);
                }
                res.locals.resource = resource;
                next();
            });
        } else {
            this.setException(404, 'Record not found', next);
        }
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
            this.setException(500, 'Nothing to render', next);
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

export default [
    PatchController.validate,
    PatchController.sanitize,
    PatchController.find,
    PatchController.update,
    PatchController.serialize,
    PatchController.render
];

export const validate = PatchController.validate;
export const sanitize = PatchController.sanitize;
export const find = PatchController.find;
export const update = PatchController.update;
export const serialize = PatchController.serialize;
export const render = PatchController.render;
