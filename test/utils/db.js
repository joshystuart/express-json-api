/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import q from 'q';
import mongoose from 'mongoose';
import config from '../config/config';
import logger from '../../src/utils/logger';

/**
 * A DB util class that abstracts mongoose functions.
 *
 * @constructor
 */
class Db {
    constructor(options) {
        options = options || {}; // eslint-disable-line no-param-reassign
        this.autoReconnect = options.autoReconnect || false;
    }

    /**
     * Returns the mongo connection url based on the current config.
     *
     * @returns {string}
     * @private
     */
    _getConnectionUrl() {
        return config.db;
    }

    /**
     * Instantiate the database connection
     */
    connect() {
        let connect;
        const deferred = q.defer();

        if (!this._db || this._db.readyState !== mongoose.Connection.STATES.connected) {
            // Connect to mongodb
            connect = () => {
                const options = {server: {socketOptions: {keepAlive: 1}}};

                mongoose.connect(this._getConnectionUrl(), options);
            };

            // connect to mongo
            connect();

            this._db = mongoose.connection;
            this._db.on('error', (err) => {
                logger.info('Connection error', err);
                throw new Error(`unable to connect to database using: ${this._getConnectionUrl()}`);
            });
            this._db.on('close', () => {
                logger.info('Connection closed');
            });
            this._db.on('connected', () => {
                logger.info('Connection opened');
                deferred.resolve();
            });
            this._db.on('disconnected', () => {
                if (this.autoReconnect) {
                    connect();
                }
            });
        } else {
            // the db is still connected, so just resolve
            deferred.resolve();
        }

        return deferred.promise;
    }

    disconnect() {
        if (!!this._db && this._db.readyState === mongoose.Connection.STATES.connected) {
            this.autoReconnect = false;
            this._db.close();
        }
    }

    /**
     * A wrapper around the mongoose save function and returns a promise.
     * @param object
     * @returns {Promise}
     * @public
     */
    create(object) {
        return q.ninvoke(object, 'save').
        then(() => {
            return object;
        });
    }

    /**
     * A wrapper around the mongoose save function to 'update', even though they are the same thing as create,
     * other ODMs may differ so this is a way to hedge for the future.
     *
     * @param object
     */
    update(object) {
        return q.ninvoke(object, 'save').
        then(() => {
            return object;
        });
    }

    /**
     * Imports passed data to schema using serial promises.
     *
     * @param Schema
     * @param data
     * @returns {Promise}
     * @public
     */
    import(Schema, data) {
        return data.reduce((promise, entry) => {
            return this.create(new Schema(entry));
        }, q.resolve());
    }

    /**
     * Removes all data from the passed collection schema.
     *
     * @param Schema
     * @returns {Promise}
     * @public
     */
    removeAll(Schema) {
        return q.ninvoke(Schema, 'remove', {});
    }

    /**
     * A wrapper function for the mongoose 'find'.
     *
     * @param Schema
     * @param options
     * @returns {Promise}
     * @public
     */
    findAll(Schema, options) {
        let query;

        if (!options) {
            options = { // eslint-disable-line no-param-reassign
                criteria: {}
            };
        } else if (!options.criteria) {
            options.criteria = {};
        }

        query = Schema.find(options.criteria);

        if (!!options.populate) {
            query.populate(options.populate);
        }

        if (!!options.lean) {
            query.lean();
        }

        if (!!options.select) {
            query.select(options.select);
        }

        return this.execute(query);
    }

    /**
     * A wrapper function for the mongoose 'findOne'.
     *
     * @param Schema
     * @param options
     * @returns {Promise}
     * @public
     */
    find(Schema, options) {
        let query;

        if (!options) {
            options = { // eslint-disable-line no-param-reassign
                criteria: {}
            };
        } else if (!options.criteria) {
            options.criteria = {};
        }

        query = Schema.findOne(options.criteria);

        if (!!options.populate) {
            query = query.populate(options.populate);
        }

        if (!!options.lean) {
            query.lean();
        }

        if (!!options.select) {
            query.select(options.select);
        }

        return this.execute(query);
    }

    /**
     * Wraps a mongoose query in a 'q' promise.
     *
     * @param query
     * @returns {Promise}
     * @public
     */
    execute(query) {
        const deferred = q.defer();

        query.exec((err, results) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(results);
            }
        });

        return deferred.promise;
    }

    /**
     * Returns the mongo connection.
     *
     * @returns {*}
     */
    getConnection() {
        return this._db;
    }
}

module.exports = new Db();
