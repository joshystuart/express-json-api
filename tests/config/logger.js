/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
const _ = require('underscore');
const config = require('../../config/config');
const winston = require('winston');

/**
 * A utils service for logging
 *
 * @constructor
 */
function LoggerUtilService() {
    this.logger = new (winston.Logger)();

    // add transports
    _.forEach(config.logger.transports, function(transport) {
        if (!!winston.transports[transport] && !!config.logger[transport]) {
            this.logger.add(winston.transports[transport], config.logger[transport]);
        }
    }.bind(this));
}

/**
 * Log an error.
 *
 * @param messages
 */
LoggerUtilService.prototype.error = function() {
    _.forEach(arguments, function(argument) {
        this.logger.error(config.logger.prefix, argument);
    }.bind(this));
};

/**
 * Log a warning.
 *
 * @param messages
 */
LoggerUtilService.prototype.warning = function() {
    _.forEach(arguments, function(argument) {
        this.logger.warn(config.logger.prefix, argument);
    }.bind(this));
};

/**
 * Log an info.
 *
 * @param message
 */
LoggerUtilService.prototype.info = function() {
    _.forEach(arguments, function(argument) {
        this.logger.info(config.logger.prefix, argument);
    }.bind(this));
};

/**
 * Log.
 *
 * @param message
 */
LoggerUtilService.prototype.log = function() {
    _.forEach(arguments, function(argument) {
        this.logger.log(config.logger.prefix, argument);
    }.bind(this));
};

/**
 * Expose
 * @type {UserService}
 */
module.exports = exports = new LoggerUtilService();
