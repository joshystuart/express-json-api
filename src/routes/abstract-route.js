/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import _ from 'lodash';

/**
 * An abstract route class
 */
class AbstractRoute {
    /**
     * Adds the route path to the express app router.
     *
     * @param path
     * @param method
     * @param router
     * @param config
     * @param middleware
     */
    addPathToRouter(path, method, router, config, middleware) {
        router[method](path, (req, res, next) => {
            // apply target
            this.setRouteConfigOnResponse(config, req, res);

            next();
        }, middleware);
    }

    /**
     * Sets the model on the request so that other middleware can use it.
     *
     * @param config
     * @param req
     * @param res
     */
    setRouteConfigOnResponse(config, req, res) {
        res.locals.id = config.id;
        res.locals.model = config.model;
        res.locals.populate = config.populate;
        res.locals.mapper = config.mapper;
        res.locals.limit = config.limit;
        res.locals.sanitize = config.sanitize;
        res.locals.search = config.search;
        res.locals.metadata = config.metadata;
        res.locals.lean = _.isUndefined(config.lean) ? true : !!config.lean;
    }
}

export default AbstractRoute;
