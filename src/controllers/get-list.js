/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
const _ = require('lodash');
const logger = require('../utils/logger');

function modelNotFoundException(next) {
    const err = new Error('Target Model Not Found');
    err.status = 500;
    next(err);
}

function queryNotFoundException(next) {
    const err = new Error('Query Not Found');
    err.status = 500;
    next(err);
}

/**
 * Instantiates the monogo query by mapping the route to the mongoose model.
 *
 * @param req
 * @param res
 * @param next
 */
function query(req, res, next) {
    const model = res.locals.model;
    if (!!model) {
        const criteria = res.locals.criteria || {};
        res.locals.query = model.find(criteria);

        if (!!res.locals.populate) {
            logger.info('Populating model with the following fields: ', res.locals.populate);
            res.locals.query = res.locals.query.populate(res.locals.populate);
        }

        res.locals.query.lean();

        next();
    } else {
        modelNotFoundException(next);
    }
}

/**
 * Constructs the search query and applies it to the mongo query.
 *
 * @param req
 * @param res
 * @param next
 */
function search(req, res, next) {
    const config = res.locals.search;
    const criterion = {$or: []};
    const param = req.query.q;
    const criteria = res.locals.criteria || {};

    if (!!res.locals.model) {
        if (!!config && !!config.active && !!param) {
            const terms = param.trim().split(' ');
            const matchingExpressions = terms.
            filter(function(term) {
                if (!_.isEmpty(term)) {
                    return term;
                }
            }).
            map(function(term) {
                return new RegExp(term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
            });

            _.forEach(config.fields, function(fieldName) {
                const field = {};
                field[fieldName] = {$in: matchingExpressions};
                criterion.$or.push(field);
            });
        }

        if (criterion.$or.length > 0) {
            res.locals.criteria = _.extend(criteria, criterion);

            logger.info('Setting search criteria: ', criterion);
        }
        next();
    } else {
        modelNotFoundException(next);
    }
}

/**
 * Applies the filters to the mongo query.
 *
 * @param req
 * @param res
 * @param next
 */
function filter(req, res, next) {
    const model = res.locals.model;
    const criterion = {$and: []};
    const criteria = res.locals.criteria || {};

    if (!!model && !!model.schema) {
        const schema = model.schema;

        if (!!req.query.filter) {
            _.forEach(req.query.filter, function(value, key) {
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
            logger.info('Setting filter criteria: ', criterion);
        }
        next();
    } else {
        modelNotFoundException(next);
    }
}

/**
 * Applies sort to the mongo query.
 *
 * @param req
 * @param res
 * @param next
 */
function sort(req, res, next) {
    const model = res.locals.model;
    const resQuery = res.locals.query;

    if (!!model && !!model.schema) {
        const schema = model.schema;
        if (!!req.query.sort) {
            const sorts = req.query.sort.split(',');

            _.forEach(sorts, function(sortItem) {
                // remove the descending term to find if the property exists on the model/schema.
                const field = _.trimLeft(sortItem, '-');
                if (!!schema.path(field)) {
                    logger.info('Applying sort by: ' + sortItem);
                    resQuery.sort(sortItem);
                }
            });
        }

        next();
    } else {
        modelNotFoundException(next);
    }
}

/**
 * Creates the paging data eg. The total, limit and offset.
 *
 * @param req
 * @param res
 * @param next
 */
function page(req, res, next) {
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
        resQuery.count(function(err, total) {
            // set the page on the response
            res.locals.page = {
                total: _.round(total),
                limit: _.round(req.query.page.limit),
                offset: _.round(req.query.page.offset)
            };

            logger.info('Applying offset: ' + res.locals.page.offset);
            logger.info('Applying limit: ' + res.locals.page.limit);

            // reset and add limits
            resQuery.skip(res.locals.page.offset).
            limit(res.locals.page.limit);

            next(err);
        });
    } else {
        queryNotFoundException(next);
    }
}

/**
 * Executes the mongo query.
 *
 * @param req
 * @param res
 * @param next
 */
function execute(req, res, next) {
    const resQuery = res.locals.query;

    if (!!resQuery) {
        resQuery.lean();
        resQuery.exec('find', function(err, results) {
            if (err) {
                next(err);
            } else {
                res.locals.resources = results;
                next();
            }
        });
    } else {
        modelNotFoundException(next);
    }
}

/**
 * If a serializer is provided, the data is mapped from the model structure, to the provided response structure.
 *
 * // TODO centralize serializer / unserializer and make it asynchronous.
 *
 * @param req
 * @param res
 * @param next
 */
function serialize(req, res, next) {
    // run the data through any serializers or data mappers
    const resources = res.locals.resources;
    const mapper = res.locals.mapper;

    if (!!resources && !!mapper && typeof mapper.serialize === 'function') {
        const serializedResults = [];

        _.forEach(resources, function(model) {
            serializedResults.push(mapper.serialize(model));
        });

        res.locals.resources = serializedResults;
        next();
    } else {
        res.locals.resources = resources;
        next();
    }
}

/**
 * Renders the models to the json response.
 *
 * @param req
 * @param res
 */
function render(req, res, next) {
    const resources = res.locals.resources;

    if (typeof(resources) === 'undefined') {
        const err = new Error('Nothing to render');
        err.status = 500;
        next(err);
    }

    // send the data back to the client
    res.json({
        meta: {
            page: res.locals.page
        },
        data: resources
    });
}

/**
 * Expose all the functions so that they can be reused in custom implementations.
 */
module.exports.query = query;
module.exports.search = search;
module.exports.filter = filter;
module.exports.sort = sort;
module.exports.page = page;
module.exports.execute = execute;
module.exports.serialize = serialize;
module.exports.render = render;

/**
 * Expose a default get-list implementation.
 */
module.exports.default = [
    search,
    filter,
    query,
    sort,
    page,
    execute,
    serialize,
    render
];
