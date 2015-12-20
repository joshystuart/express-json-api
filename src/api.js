/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
const _ = require('lodash');
const express = require('express');
const get = require('./controllers/get');
const getList = require('./controllers/get-list');
const patch = require('./controllers/patch');

/**
 * Sets the model on the request so that other middleware can use it.
 *
 * @param route
 * @param req
 */
function applyRouteConfig(route, req, res) {
    res.locals.id = route.id;
    res.locals.model = route.model;
    res.locals.populate = route.populate;
    res.locals.mapper = route.mapper;
    res.locals.limit = route.limit;
    res.locals.sanitize = route.sanitize;
    res.locals.search = route.search;
}

/**
 * Create the get-list (or get all) endpoint.
 *
 * @param router
 * @param route
 * @param middleware
 */
function createGetListRoute(router, route, middleware) {
    router.get('/', function(req, res, next) {
        // apply target
        applyRouteConfig(route, req, res);

        next();
    }, middleware);
}

/**
 * Create the get endpoint.
 *
 * @param router
 * @param route
 * @param middleware
 */
function createGetRoute(router, route, middleware) {
    router.get('/:' + route.id, function(req, res, next) {
        applyRouteConfig(route, req, res);

        next();
    }, middleware);
}

/**
 * Create the patch endpoint.
 *
 * @param router
 * @param route
 * @param middleware
 */
function createPatchRoute(router, route, middleware) {
    router.patch('/:' + route.id, function(req, res, next) {
        applyRouteConfig(route, req, res);

        next();
    }, middleware);
}

/**
 * Create the defined route methods for the endpoint.
 *
 * @param app
 * @param route
 */
function createRoute(app, route) {
    const router = express.Router(); // eslint-disable-line new-cap
    app.use(route.endpoint, router);

    _.forEach(route.methods, function(actions, key) {
        switch (key) {
            case 'get':
                createGetRoute(router, route, actions);
                break;
            case 'getList':
                createGetListRoute(router, route, actions);
                break;
            case 'head':
                // TODO
                break;
            case 'options':
                // TODO
                break;
            case 'patch':
                createPatchRoute(router, route, actions);
                break;
            case 'post':
                // TODO
                break;
            default:
                break;
        }
    });
}

/**
 * Create all the defined endpoints.
 *
 * @param app
 * @param config
 */
function createRoutes(app, config) {
    _.forEach(config.routes, function(route) {
        createRoute(app, route);
    });
}

/**
 * Init the express-json-api middleware.
 *
 * This will create all the routes based on the endpoints in the passed config.
 *
 * @param app
 * @param config
 */
function init(app, config) {
    createRoutes(app, config);
}

/**
 * Expose the route method controllers and the init method.
 */
module.exports.init = init;
module.exports.controllers = {
    getList: getList,
    get: get,
    patch: patch
};
