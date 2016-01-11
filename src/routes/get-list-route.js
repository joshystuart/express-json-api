/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

import AbstractRoute from './abstract-route.js';

/**
 * A "get" all resources route class
 */
class GetListRoute extends AbstractRoute {
    constructor(router, config, middleware) {
        super();
        this.addPathToRouter('/', 'get', router, config, middleware);
    }
}

export default GetListRoute;
