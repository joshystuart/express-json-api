/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
const express = require('express');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * The application.
 *
 * @constructor
 */
function App() {
    this._app = express();
    require('../config/express')(this._app, config);
}

/**
 * Starts the application server listening on the configured port
 * @public
 */
App.prototype.init = function() {
    this._app.listen(config.port, function() {
        logger.info('Express server listening on port ' + config.port);
    });
};

/**
 * Returns the express instantiated application.
 * @returns {Function}
 * @public
 */
App.prototype.getExpressApplication = function() {
    return this._app;
};

module.exports = new App();
