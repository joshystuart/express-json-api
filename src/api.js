/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
var _ = require('lodash');
var express = require('express');
var router = express.Router(); // eslint-disable-line new-cap
var get = require('./controllers/get');
var getList = require('./controllers/get-list');

/**
 * Sets the model on the request so that other middleware can use it.
 *
 * @param route
 * @param req
 */
function applyRouteConfig(route, req, res) {
    req.target = route.model;
    res.limit = route.limit;
}

function createGetListRoute(route, middleware) {
    router.get('/', function(req, res, next) {
        // apply target
        applyRouteConfig(route, req, res);

        next();
    }, middleware);
}

function createGetRoute(route, middleware) {
    router.get('/:' + route.id, function(req, res, next) {
        // apply target
        applyRouteConfig(route, req, res);

        next();
    }, middleware);
}

function createPatchRoute(route, middleware) {
    router.patch('/:' + route.id, function(req, res, next) {
        // apply target
        applyRouteConfig(route, req, res);

        next();
    }, middleware);
}

function createRoute(app, route) {
    app.use(route.endpoint, router);

    _.forEach(route.methods, function(method, key) {
        if (typeof(key) === 'number' && typeof(method) === 'string') {
            // defaults
            switch (method) {
                case 'get':
                    createGetRoute(route, getList.get);
                    break;
                case 'getList':
                    createGetListRoute(route, getList.default);
                    break;
                case 'patch':
                    createPatchRoute(route, getList.default);
                    break;
                default:
                    break;
            }
        } else {
            // TODO allow overrides
        }
    });
}

function createRoutes(app, config) {
    _.forEach(config.routes, function(route) {
        createRoute(app, route);
    });
}

function expressJsonApi(app, config) {
    createRoutes(app, config);
}

module.exports = expressJsonApi;
