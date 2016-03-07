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
            super.setException(400, `Request failed validation`, next);
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

            logger.info(`Finding resource by ${res.locals.id} = ${id}`);

            if (!!res.locals.populate) {
                logger.info(`Populating model with the following fields: ${res.locals.populate}`);
                query.populate(res.locals.populate);
            }

            query.exec((err, result) => {
                if (err) {
                    super.setException(500, err.toString(), next);
                } else if (!result) {
                    super.setException(404, `Record not found`, next);
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

            updatedResource.save((error) => {
                if (error) {
                    super.setException(404, `Error on model save: ${error.toString()}`, next);
                } else {
                    res.locals.resource = updatedResource;

                    if (!!res.locals.populate) {
                        updatedResource.populate(res.locals.populate, (populateError) => {
                            if (error) {
                                super.setException(404, `Error on model populate: ${populateError.toString()}`, next);
                            } else {
                                next();
                            }
                        });
                    } else {
                        next();
                    }
                }
            });
        } else {
            super.setException(404, `Record not found`, next);
        }
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
