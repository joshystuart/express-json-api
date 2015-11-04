/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
const q = require('q');
const express = require('express');
const config = require('../config/config');
const logger = require('../../src/utils/logger');

/**
 * The application.
 *
 * @constructor
 */
function App() {
    this._server;
    this._isActive = false;
    this._app = express();
    require('../config/express')(this._app, config);
}

/**
 * Starts the application server listening on the configured port.
 *
 * @returns {Promise}
 * @public
 */
App.prototype.init = function() {
    const deferred = q.defer();

    if (!this._isActive) {
        this._server = this._app.listen(config.port, function() {
            this._isActive = true;
            logger.info('Express server listening on port ' + config.port);
            deferred.resolve();
        }.bind(this));
    } else {
        deferred.resolve();
    }

    return deferred.promise;
};

/**
 * Proxy for init.
 *
 * @returns {Promise}
 * @public
 */
App.prototype.start = function() {
    return this.init();
};

/**
 * Returns the express instantiated application.
 *
 * @returns {Function}
 * @public
 */
App.prototype.getExpressApplication = function() {
    return this._app;
};

/**
 * Stops the app server.
 *
 * @returns {Promise}
 * @public
 */
App.prototype.stop = function() {
    const deferred = q.defer();

    if (!!this._isActive && !!this._server) {
        logger.info('Stopping Express server');
        this._server.close(function() {
            this._isActive = false;
            logger.info('Stopped Express server');
            deferred.resolve();
        }.bind(this));

        delete this._server;
    } else {
        deferred.resolve();
    }

    return deferred.promise;
};

module.exports = new App();
