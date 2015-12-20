/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
function modelNotFoundException(next) {
    const err = new Error('Target Model Not Found');
    err.status = 500;
    next(err);
}

/**
 * Instantiates the monogo query by mapping the route and id to the mongoose model. This query is to find only one
 * resource.
 *
 * @param req
 * @param res
 * @param next
 */
function query(req, res, next) {
    const criteria = {};

    if (!!res.locals.model) {
        if (!!res.locals.id && !!req.params[res.locals.id]) {
            criteria[res.locals.id] = req.params[res.locals.id];
            res.locals.query = res.locals.model.findOne(criteria);
            next();
        } else {
            const err = new Error('Incorrect Parameter');
            err.status = 400;
            next(err);
        }
    } else {
        modelNotFoundException(next);
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
        resQuery.exec('findOne', function(err, result) {
            if (err) {
                next(err);
            } else if (!result) {
                const noResults = new Error('Resource not found');
                noResults.status = 404;
                next(noResults);
            } else {
                res.locals.resource = result;
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
    const resource = res.locals.resource;
    const mapper = res.locals.model.mapper;

    if (!!resource && !!mapper && typeof mapper.serialize === 'function') {
        mapper.serialize(resource, function(serialized) {
            res.locals.resource = serialized;
            next();
        });
    } else {
        res.locals.resource = resource;
        next();
    }
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

module.exports.query = query;
module.exports.execute = execute;
module.exports.serialize = serialize;
module.exports.render = render;

module.exports.default = [
    query,
    execute,
    serialize,
    render
];
