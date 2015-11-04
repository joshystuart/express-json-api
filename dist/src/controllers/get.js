/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
'use strict';

function modelNotFoundException(next) {
    var err = new Error('Target Model Not Found');
    err.status = 500;
    next(err);
}

function query(req, res, next) {
    var criteria = {};

    if (!!res.locals.model) {
        if (!!res.locals.id && !!req.params[res.locals.id]) {
            criteria[res.locals.id] = req.params[res.locals.id];
            res.locals.query = res.locals.model.findOne(criteria);
            next();
        } else {
            var err = new Error('Incorrect Parameter');
            err.status = 400;
            next(err);
        }
    } else {
        modelNotFoundException(next);
    }
}

function execute(req, res, next) {
    var resQuery = res.locals.query;

    if (!!resQuery) {
        resQuery.lean();
        resQuery.exec('findOne', function (err, results) {
            if (err) {
                next(err);
            } else if (!results) {
                var noResults = new Error('Resource not found');
                err.status = 404;
                next(noResults);
            } else {
                res.results = results;
                next();
            }
        });
    } else {
        modelNotFoundException(next);
    }
}

function serialize(req, res, next) {
    // run the data through any serializers or data mappers
    var results = res.results;
    var mapper = res.locals.model.mapper;

    if (!!results && !!mapper && typeof mapper.serialize === 'function') {
        mapper.serialize(results, function (serialized) {
            res.results = serialized;
            next();
        });
    } else {
        res.results = results;
        next();
    }
}

function render(req, res) {
    // send the data back to the client
    res.json({
        meta: {
            page: {
                total: 1,
                offset: 1,
                limit: 1
            }
        },
        data: res.results
    });
}

module.exports.query = query;
module.exports.execute = execute;
module.exports.serialize = serialize;
module.exports.render = render;

module.exports['default'] = [query, execute, serialize, render];