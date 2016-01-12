/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

import AbstractRoute from './abstract-route.js';

/**
 * A "post" route class
 */
class PostRoute extends AbstractRoute {
    constructor(router, routeConfig, middleware) {
        super();
        this.addPathToRouter('/', 'post', router, routeConfig, middleware);
    }
}

export default PostRoute;
