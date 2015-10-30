const _ = require('lodash');

function targetModelNotFoundException(next) {
    const err = new Error('Target Model Not Found');
    err.status = 500;
    next(err);
}

function recordNotFoundException(next) {
    const err = new Error('Record not found');
    err.status = 404;
    next(err);
}

function validate(req, res, next) {
    // TODO add check for req.body.type as per jsonapi.org requirements.

    if (!!req.body.data && !!req.body.data.attributes) {
        next();
    } else {
        const err = new Error('Request failed validation');
        err.status = 400;
        next(err);
    }
}

function find(req, res, next) {
    // get the resource if from the route
    const id = req.params[res.locals.id];
    const Schema = res.locals.model.schema;
    const criteria = {};

    if (!!Schema) {
        criteria[res.locals.id] = id;
        const query = Schema.findOne(criteria);

        query.exec(function(err, result) {
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
    const updates = req.body.data.attributes;
    const model = res.locals.resource;

    if (!!model) {
        const updatedModel = _.merge(model, updates);

        updatedModel.save(function(error) {
            if (error) {
                const err = new Error('Error on model save:', err);
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
    const results = res.locals.resource;

    // check if there is a mapper.serializer
    if (!!res.locals.model.mapper && !!res.locals.model.mapper.serialize) {
        const serializeFunction = res.locals.model.mapper.serialize;

        if (!!results && typeof(serializeFunction) === 'function') {
            res.locals.resource = serializeFunction(results);
        }
    } else {
        res.locals.resource = results;
    }

    next();
}

function render(req, res, next) {
    const results = res.locals.resource;

    if (typeof(results) === 'undefined') {
        const err = new Error('Nothing to render');
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

module.exports.default = [
    validate,
    find,
    update,
    serialize,
    render
];
