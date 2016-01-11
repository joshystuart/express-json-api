/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import _ from 'lodash';
import winston from 'winston';
const config = require('../../config/config');

/**
 * A utils service for logging
 *
 * @constructor
 */
class LoggerService {
    constructor() {
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
    error() {
        _.forEach(arguments, function(argument) {
            this.logger.error(config.logger.prefix, argument);
        }.bind(this));
    }

    /**
     * Log a warning.
     *
     * @param messages
     */
    warning() {
        _.forEach(arguments, function(argument) {
            this.logger.warn(config.logger.prefix, argument);
        }.bind(this));
    }

    /**
     * Log an info.
     *
     * @param message
     */
    info() {
        _.forEach(arguments, function(argument) {
            this.logger.info(config.logger.prefix, argument);
        }.bind(this));
    }

    /**
     * Log.
     *
     * @param message
     */
    log() {
        _.forEach(arguments, function(argument) {
            this.logger.log(config.logger.prefix, argument);
        }.bind(this));
    }
}

export default new LoggerService();
