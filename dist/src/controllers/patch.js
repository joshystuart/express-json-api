'use strict';

var _ = require('lodash');

function targetModelNotFoundException(next) {
    var err = new Error('Target Model Not Found');
    err.status = 500;
    next(err);
}

function recordNotFoundException(next) {
    var err = new Error('Record not found');
    err.status = 404;
    next(err);
}

function validate(req, res, next) {
    // TODO add check for req.body.type as per jsonapi.org requirements.

    if (!!req.body.data && !!req.body.data.id && !!req.body.data.attributes) {
        next();
    } else {
        var err = new Error('Request failed validation');
        err.status = 400;
        next(err);
    }
}

function find(req, res, next) {
    // get the resource if from the route
    var id = req.params[res.locals.id];
    var Schema = res.locals.model.schema;
    var criteria = {};

    if (!!Schema) {
        criteria[res.locals.id] = id;
        var query = Schema.findOne(criteria);

        query.exec(function (err, result) {
            if (err) {
                recordNotFoundException(next);
            } else {
                res.locals.resource = result;
                next();
            }
        });
    } else {
        targetModelNotFoundException(next);
    }
}

function update(req, res, next) {
    var updates = req.body.data.attributes;
    var model = res.locals.resource;

    if (!!model) {
        var updatedModel = _.merge(model, updates);

        updatedModel.save(function (error) {
            if (error) {
                var err = new Error('Error on model save:', err);
                err.status = 404;
                next(err);
            }
            res.locals.resource = model;
            next();
        });
    } else {
        recordNotFoundException(next);
    }
}

function serialize(req, res, next) {
    var results = res.locals.resource;

    // check if there is a mapper.serializer
    if (!!res.locals.model.mapper && !!res.locals.model.mapper.serialize) {
        var serializeFunction = res.locals.model.mapper.serialize;

        if (!!results && typeof serializeFunction === 'function') {
            res.locals.resource = serializeFunction(results);
        }
    } else {
        res.locals.resource = results;
    }

    next();
}

function render(req, res, next) {
    var results = res.locals.resource;

    if (typeof results === 'undefined') {
        var err = new Error('Nothing to render');
        err.status = 500;
        next(err);
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
        data: res.locals.resource
    });
}

module.exports.validate = validate;
module.exports.find = find;
module.exports.update = update;
module.exports.serialize = serialize;
module.exports.render = render;

module.exports['default'] = [validate, find, update, serialize, render];