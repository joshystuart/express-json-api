/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

import AbstractRoute from './abstract-route.js';

/**
 * A "patch" route class
 */
class PatchRoute extends AbstractRoute {
    constructor(router, routeConfig, middleware) {
        super();
        this.addPathToRouter('/:' + routeConfig.id, 'patch', router, routeConfig, middleware);
    }
}

export default PatchRoute;
