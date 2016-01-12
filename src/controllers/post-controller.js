/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

import AbstractCreateController from './abstract-create-controller.js';

class PostController extends AbstractCreateController {
    static validate(req, res, next) {
        if (!!req.body.data && !!req.body.data.attributes) {
            next();
        } else {
            super.setException(400, 'Request failed validation', next);
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
            model.create(req.body.data.attributes, function(error, result) {
                if (error) {
                    super.setException(500, 'Error on model save: ' + error.toString(), next);
                }

                res.locals.resource = result;
                next();
            });
        } else {
            super.setException(500, 'Model not found.', next);
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
