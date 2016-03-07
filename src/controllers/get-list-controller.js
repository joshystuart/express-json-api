/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

import _ from 'lodash';
import AbstractReadController from './abstract-read-controller.js';
import logger from '../utils/logger.js';

class GetListController extends AbstractReadController {
    /**
     * Instantiates the monogo query by mapping the route to the mongoose model.
     *
     * @param req
     * @param res
     * @param next
     */
    static query(req, res, next) {
        const model = res.locals.model;
        if (!!model) {
            const criteria = res.locals.criteria || {};
            res.locals.query = model.find(criteria);

            if (!!res.locals.populate) {
                logger.info(`Populating model with the following fields: ${res.locals.populate}`);
                res.locals.query = res.locals.query.populate(res.locals.populate);
            }

            res.locals.query.lean();

            next();
        } else {
            super.setModelNotFoundException(next);
        }
    }

    /**
     * Constructs the search query and applies it to the mongo query.
     *
     * @param req
     * @param res
     * @param next
     */
    static search(req, res, next) {
        const config = res.locals.search;
        const criterion = {$or: []};
        const param = req.query.q;
        const criteria = res.locals.criteria || {};

        if (!!res.locals.model) {
            if (!!config && !!config.active && !!param) {
                const terms = param.trim().split(' ');
                const matchingExpressions = terms.
                filter((term) => {
                    if (!_.isEmpty(term)) {
                        return term;
                    }
                }).
                map((term) => {
                    return new RegExp(term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
                });

                _.forEach(config.fields, (fieldName) => {
                    const field = {};
                    field[fieldName] = {$in: matchingExpressions};
                    criterion.$or.push(field);
                });
            }

            if (criterion.$or.length > 0) {
                res.locals.criteria = _.extend(criteria, criterion);

                logger.info(`Setting search criteria: ${criterion}`);
            }
            next();
        } else {
            super.setModelNotFoundException(next);
        }
    }

    /**
     * Applies the filters to the mongo query.
     *
     * @param req
     * @param res
     * @param next
     */
    static filter(req, res, next) {
        const model = res.locals.model;
        const criterion = {$and: []};
        const criteria = res.locals.criteria || {};

        if (!!model && !!model.schema) {
            const schema = model.schema;

            if (!!req.query.filter) {
                _.forEach(req.query.filter, (value, key) => {
                    if (!!schema.path(key)) {
                        const field = {};

                        // handle multiple comma separated values
                        if (value.indexOf(',') > -1) {
                            field[key] = {
                                $in: value.split(',')
                            };
                        } else {
                            field[key] = value;
                        }
                        criterion.$and.push(field);
                    }
                });
            }

            if (criterion.$and.length > 0) {
                res.locals.criteria = _.extend(criteria, criterion);
                logger.info(`Setting filter criteria: ${criterion}`);
            }
            next();
        } else {
            super.setModelNotFoundException(next);
        }
    }

    /**
     * Applies sort to the mongo query.
     *
     * @param req
     * @param res
     * @param next
     */
    static sort(req, res, next) {
        const model = res.locals.model;
        const resQuery = res.locals.query;

        if (!!model && !!model.schema) {
            const schema = model.schema;
            if (!!req.query.sort) {
                const sorts = req.query.sort.split(',');

                _.forEach(sorts, (sortItem) => {
                    // remove the descending term to find if the property exists on the model/schema.
                    const field = _.trimLeft(sortItem, '-');
                    if (!!schema.path(field)) {
                        logger.info(`Applying sort by: ${sortItem}`);
                        resQuery.sort(sortItem);
                    }
                });
            }

            next();
        } else {
            super.setModelNotFoundException(next);
        }
    }

    /**
     * Creates the paging data eg. The total, limit and offset.
     *
     * @param req
     * @param res
     * @param next
     */
    static page(req, res, next) {
        const resQuery = res.locals.query;

        if (!!resQuery) {
            if (!req.query.page) {
                req.query.page = {};
            }

            if (!req.query.page.offset) {
                req.query.page.offset = 0;
            }

            if (!req.query.page.limit || req.query.page.limit > res.locals.limit) {
                req.query.page.limit = res.locals.limit;
            }

            // run the query to get the total
            resQuery.count((err, total) => {
                // set the page on the response
                res.locals.page = {
                    total: _.round(total),
                    limit: _.round(req.query.page.limit),
                    offset: _.round(req.query.page.offset)
                };

                logger.info(`Applying offset: ${res.locals.page.offset}`);
                logger.info(`Applying limit: ${res.locals.page.limit}`);

                // reset and add limits
                resQuery.skip(res.locals.page.offset).
                limit(res.locals.page.limit);

                next(err);
            });
        } else {
            this.setException(500, `Query Not Found`, next);
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
            resQuery.exec('find', (err, results) => {
                if (err) {
                    next(err);
                } else {
                    res.locals.resources = results;
                    next();
                }
            });
        } else {
            super.setModelNotFoundException(next);
        }
    }

    /**
     * Renders the models to the json response.
     *
     * @param req
     * @param res
     */
    static render(req, res, next) {
        const resources = res.locals.resources;

        if (typeof(resources) === 'undefined') {
            this.setException(500, `Nothing to render`, next);
        }

        // send the data back to the client
        res.json({
            meta: {
                page: res.locals.page
            },
            data: resources
        });
    }
}

export default [
    GetListController.search,
    GetListController.filter,
    GetListController.query,
    GetListController.sort,
    GetListController.page,
    GetListController.execute,
    GetListController.serialize,
    GetListController.render
];

export const search = GetListController.search;
export const filter = GetListController.filter;
export const query = GetListController.query;
export const sort = GetListController.sort;
export const page = GetListController.page;
export const execute = GetListController.execute;
export const serialize = GetListController.serialize;
export const render = GetListController.render;
