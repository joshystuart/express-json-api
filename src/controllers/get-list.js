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

function query(req, res, next) {
    const model = res.locals.model;
    if (!!model) {
        const criteria = res.locals.criteria || {};
        res.locals.query = model.schema.find(criteria);

        if (!!model.populate) {
            logger.info('Populating model with the following fields: ', model.populate);
            res.locals.query = res.locals.query.populate(model.populate);
        }

        next();
    } else {
        modelNotFoundException(next);
    }
}

function search(req, res, next) {
    const config = res.locals.search;
    const criterion = {$or: []};
    const param = req.query.q;
    const criteria = res.locals.criteria || {};

    if (!!res.locals.model) {
        if (!!config && !!config.active && !!param) {
            const terms = {$in: param.trim().split(' ')};

            _.forEach(config.fields, function(fieldName) {
                const field = {};
                field[fieldName] = terms;
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

function filter(req, res, next) {
    const model = res.locals.model.schema;
    const criterion = {$and: []};
    const criteria = res.locals.criteria || {};

    if (!!model && !!model.schema) {
        const schema = model.schema;

        if (!!req.query.filter) {
            _.forEach(req.query.filter, function(value, key) {
                if (!!schema.path(key)) {
                    const field = {};
                    field[key] = value;
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

function sort(req, res, next) {
    const model = res.locals.model.schema;
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

function serialize(req, res, next) {
    // run the data through any serializers or data mappers
    const results = res.locals.resources;
    const mapper = res.locals.model.mapper;

    if (!!results && !!mapper && typeof mapper.serialize === 'function') {
        const serializedResults = [];

        _.forEach(results, function(model) {
            serializedResults.push(mapper.serialize(model));
        });

        res.locals.resources = serializedResults;
        next();
    } else {
        res.locals.resources = results;
        next();
    }
}

function render(req, res) {
    // send the data back to the client
    res.json({
        meta: {
            page: res.locals.page
        },
        data: res.locals.resources
    });
}

module.exports.query = query;
module.exports.search = search;
module.exports.filter = filter;
module.exports.sort = sort;
module.exports.page = page;
module.exports.execute = execute;
module.exports.serialize = serialize;
module.exports.render = render;

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
