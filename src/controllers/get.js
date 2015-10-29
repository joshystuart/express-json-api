/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
function targetModelNotFoundException(next) {
    const err = new Error('Target Model Not Found');
    err.status = 500;
    next(err);
}

function query(req, res, next) {
    const criteria = {};
    let err;

    if (!!req.target) {
        if (!!req.id && !!req.params[req.id]) {
            criteria[req.id] = req.params[req.id];
            res.query = req.target.findOne(criteria);
            next();
        } else {
            err = new Error('Incorrect Parameter');
            err.status = 400;
            next(err);
        }
    } else {
        targetModelNotFoundException(next);
    }
}

function execute(req, res, next) {
    const resQuery = res.query;

    if (!!resQuery) {
        resQuery.lean();
        resQuery.exec('findOne', function(err, results) {
            let noResults;

            if (err) {
                next(err);
            } else if (!results) {
                noResults = new Error('Resource not found');
                err.status = 404;
                next(noResults);
            } else {
                res.results = results;
                next();
            }
        });
    } else {
        targetModelNotFoundException(next);
    }
}

function serialize(req, res, next) {
    // run the data through any serializers or data mappers
    const results = res.results;

    if (!!results) {
        // TODO: serialize
    }
    res.results = results;

    next();
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
module.exports.prepareViewModel = render;

module.exports.default = [
    query,
    execute,
    serialize,
    render
];
