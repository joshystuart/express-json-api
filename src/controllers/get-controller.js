/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */
import AbstractReadController from './abstract-read-controller.js';

class GetController extends AbstractReadController {
    /**
     * Instantiates the monogo query by mapping the route and id to the mongoose model. This query is to find only one
     * resource.
     *
     * @param req
     * @param res
     * @param next
     */
    static query(req, res, next) {
        const criteria = {};

        if (!!res.locals.model) {
            if (!!res.locals.id && !!req.params[res.locals.id]) {
                criteria[res.locals.id] = req.params[res.locals.id];
                res.locals.query = res.locals.model.findOne(criteria);
                next();
            } else {
                super.setException(400, `Incorrect Parameter`, next);
            }
        } else {
            super.setModelNotFoundException(next);
        }
    }

    /**
     * Executes the mongo query.
     *
     * @param req
     * @param res
     * @param next
     */
    static execute(req, res, next) {
        const resQuery = res.locals.query;

        if (!!resQuery) {
            resQuery.lean();
            resQuery.exec('findOne', (err, result) => {
                if (err) {
                    next(err);
                } else if (!result) {
                    super.setException(404, `Resource not found`, next);
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
     * Renders the model to the json response.
     *
     * @param req
     * @param res
     * @param next
     */
    static render(req, res, next) {
        const resource = res.locals.resource;

        if (typeof(resource) === 'undefined') {
            super.setException(500, `Nothing to render`, next);
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
    GetController.query,
    GetController.execute,
    GetController.serialize,
    GetController.render
];

export const query = GetController.query;
export const execute = GetController.execute;
export const serialize = GetController.serialize;
export const render = GetController.render;
