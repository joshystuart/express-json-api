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

/**
 * Validates the request input to ensure that it contains an id and attributes.
 *
 * @param req
 * @param res
 * @param next
 */
function validate(req, res, next) {
    // TODO add check for req.body.type as per jsonapi.org requirements.

    if (!!req.body.data && !!req.body.data.id && !!req.body.data.attributes) {
        next();
    } else {
        const err = new Error('Request failed validation');
        err.status = 400;
        next(err);
    }
}

/**
 * Sanitize the input to ensure the data submitted does is escaped correctly.
 *
 * This allows for a custom sanitizer, but also falls back to a default xss sanitizer.
 *
 * @param req
 * @param res
 * @param next
 */
function sanitize(req, res, next) {
    const options = res.locals.sanitize;
    let sanitizer = options.method;
    const updates = req.body.data.attributes;

    if (typeof(sanitizer) === 'undefined') {
        sanitizer = require('../utils/sanitizer');
    }

    if (options.active && typeof(options.fields) === 'undefined') {
        // sanitize all fields
        _.forEach(_.keys(updates), function(field) {
            updates[field] = sanitizer.sanitize(updates[field]);
        });
    } else if (options.active && options.fields.constructor === Array) {
        // sanitize selected fields
        _.forEach(_.keys(updates), function(field) {
            if (options.fields.indexOf(field) > -1) {
                updates[field] = sanitizer.sanitize(updates[field]);
            }
        });
    }

    req.body.data.attributes = updates;
    next();
}

/**
 * Finds the resource based on the id and model registered to the route.
 *
 * @param req
 * @param res
 * @param next
 */
function find(req, res, next) {
    // get the resource if from the route
    const id = req.params[res.locals.id];
    const model = res.locals.model;
    const criteria = {};

    if (!!model) {
        criteria[res.locals.id] = id;
        const query = model.findOne(criteria);

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

/**
 * Updates the found model with the passed data. Since this is a patch, it is a merge, rather than a replace.
 *
 * @param req
 * @param res
 * @param next
 */
function update(req, res, next) {
    const updates = req.body.data.attributes;
    const resource = res.locals.resource;

    if (!!resource) {
        const updatedResource = _.merge(resource, updates);

        updatedResource.save(function(error) {
            if (error) {
                const err = new Error('Error on model save:', err);
                err.status = 404;
                next(err);
            }
            res.locals.resource = resource;
            next();
        });
    } else {
        recordNotFoundException(next);
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
    const resource = res.locals.resource;

    // check if there is a mapper.serializer
    if (!!res.locals.mapper && !!res.locals.mapper.serialize) {
        const serializeFunction = res.locals.mapper.serialize;

        if (!!resource && typeof(serializeFunction) === 'function') {
            res.locals.resource = serializeFunction(resource);
        }
    } else {
        res.locals.resource = resource;
    }

    next();
}

/**
 * Renders the model to the json response.
 *
 * @param req
 * @param res
 * @param next
 */
function render(req, res, next) {
    const resource = res.locals.resource;

    if (typeof(resource) === 'undefined') {
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
        data: resource
    });
}

/**
 * Expose all the functions so that they can be reused in custom implementations.
 */
module.exports.validate = validate;
module.exports.sanitize = sanitize;
module.exports.find = find;
module.exports.update = update;
module.exports.serialize = serialize;
module.exports.render = render;

/**
 * Expose a default patch implementation.
 */
module.exports.default = [
    validate,
    sanitize,
    find,
    update,
    serialize,
    render
];
