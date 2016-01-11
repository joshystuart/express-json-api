/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

import AbstractRoute from './abstract-route.js';

/**
 * A "get" route class
 */
class GetRoute extends AbstractRoute {
    constructor(router, routeConfig, middleware) {
        super();
        this.addPathToRouter('/:' + routeConfig.id, 'get', router, routeConfig, middleware);
    }
}

export default GetRoute;
