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
    res.locals.limit = route.limit;
    res.locals.search = route.search;
}

function createGetListRoute(router, route, middleware) {
    router.get('/', function(req, res, next) {
        // apply target
        applyRouteConfig(route, req, res);

        next();
    }, middleware);
}

function createGetRoute(router, route, middleware) {
    router.get('/:' + route.id, function(req, res, next) {
        // apply target
        applyRouteConfig(route, req, res);

        next();
    }, middleware);
}

function createPatchRoute(router, route, middleware) {
    router.patch('/:' + route.id, function(req, res, next) {
        // apply target
        applyRouteConfig(route, req, res);

        next();
    }, middleware);
}

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
            case 'patch':
                createPatchRoute(router, route, actions);
                break;
            default:
                break;
        }
    });
}

function createRoutes(app, config) {
    _.forEach(config.routes, function(route) {
        createRoute(app, route);
    });
}

function init(app, config) {
    createRoutes(app, config);
}

module.exports.init = init;
module.exports.controllers = {
    getList: getList,
    get: get,
    patch: patch
};
