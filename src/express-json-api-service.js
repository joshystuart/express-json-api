/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import _ from 'lodash';
import express from 'express';
import * as allControllers from './controllers.js';
import GetRoute from './routes/get-route.js';
import GetListRoute from './routes/get-list-route.js';
import PatchRoute from './routes/patch-route.js';
import PostRoute from './routes/post-route.js';

class ExpressJsonApiService {
    constructor(app, config) {
        this.createRoutes(app, config.routes);
    }

    /**
     * Create all the defined endpoints.
     *
     * @param app
     * @param routes
     */
    createRoutes(app, routes) {
        // iterate through all configured routes
        _.forEach(routes, function(route) {
            this.createRoute(app, route);
        }.bind(this));
    }

    /**
     * Create the defined route methods for the endpoint.
     *
     * @param app
     * @param routeConfig
     */
    createRoute(app, routeConfig) {
        const routes = [];
        const router = express.Router(); // eslint-disable-line new-cap
        app.use(routeConfig.endpoint, router);

        _.forEach(routeConfig.methods, function(middleware, method) {
            let route;
            switch (method) {
                case 'get':
                    route = new GetRoute(router, routeConfig, middleware);
                    break;
                case 'getList':
                    route = new GetListRoute(router, routeConfig, middleware);
                    break;
                case 'head':
                    // TODO
                    break;
                case 'options':
                    // TODO
                    break;
                case 'patch':
                    route = new PatchRoute(router, routeConfig, middleware);
                    break;
                case 'post':
                    route = new PostRoute(router, routeConfig, middleware);
                    break;
                default:
                    break;
            }

            if (!!route) {
                routes.push(route);
            }
        });
    }
}

export default ExpressJsonApiService;
export const controllers = allControllers;
// for es5 backwards compatibility instead of using ExpressJsonApiService.factory(app, config).
export const factory = function(app, config) {
    return new ExpressJsonApiService(app, config);
};
