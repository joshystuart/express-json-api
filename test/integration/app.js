/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import q from 'q';
import express from 'express';
import mongoose from 'mongoose';
import config from '../config/config';
import logger from '../../src/utils/logger';

/**
 * The application.
 *
 * @constructor
 */
class App {
    constructor() {
        this._server;
        this._isActive = false;
        this._app = express();
        require('../config/express')(this._app, config);

        mongoose.set('debug', function(coll, method, query, doc, options) {
            const log = {
                coll: coll,
                method: method,
                query: query,
                doc: doc,
                options: options
            };
            logger.info(`Mongoose:`, log);
        });
    }

    /**
     * Starts the application server listening on the configured port.
     *
     * @returns {Promise}
     * @public
     */
    init() {
        const deferred = q.defer();

        if (!this._isActive) {
            this._server = this._app.listen(config.port, () => {
                this._isActive = true;
                logger.info('Express server listening on port ' + config.port);
                deferred.resolve();
            });
        } else {
            deferred.resolve();
        }

        return deferred.promise;
    }

    /**
     * Proxy for init.
     *
     * @returns {Promise}
     * @public
     */
    start() {
        return this.init();
    }

    /**
     * Returns the express instantiated application.
     *
     * @returns {Function}
     * @public
     */
    getExpressApplication() {
        return this._app;
    }

    /**
     * Stops the app server.
     *
     * @returns {Promise}
     * @public
     */
    stop() {
        const deferred = q.defer();

        if (!!this._isActive && !!this._server) {
            logger.info('Stopping Express server');
            this._server.close(() => {
                this._isActive = false;
                logger.info('Stopped Express server');
                deferred.resolve();
            });

            delete this._server;
        } else {
            deferred.resolve();
        }

        return deferred.promise;
    }
}

module.exports = new App();
