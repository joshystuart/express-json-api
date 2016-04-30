/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

import AbstractCreateController from './abstract-create-controller.js';

class PostController extends AbstractCreateController {
    static validate(req, res, next) {
        if (!!req.body.data && !!req.body.data.attributes) {
            next();
        } else {
            super.setException(400, `Request failed validation`, next);
        }
    }

    /**
     * Creates then returns a new record with the passed data.
     *
     * @param req
     * @param res
     * @param next
     */
    static create(req, res, next) {
        const model = res.locals.model;

        if (!!model) {
            model.create(req.body.data.attributes, (error, result) => {
                if (error) {
                    super.setException(500, `Error on model save: ${error.toString()}`, next);
                }

                res.locals.resource = result;

                if (!!res.locals.populate) {
                    result.populate(res.locals.populate, (populateError) => {
                        if (error) {
                            super.setException(404, `Error on model populate: ${populateError.toString()}`, next);
                        } else {
                            next();
                        }
                    });
                } else {
                    next();
                }
            });
        } else {
            super.setException(500, `Model not found.`, next);
        }
    }
}

export default [
    PostController.validate,
    PostController.sanitize,
    PostController.create,
    PostController.serialize,
    PostController.render
];

export const validate = PostController.validate;
export const sanitize = PostController.sanitize;
export const create = PostController.create;
export const serialize = PostController.serialize;
export const render = PostController.render;
