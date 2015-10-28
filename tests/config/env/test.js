/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
module.exports = {
    app: {
        name: 'express-json-api-test'
    },
    port: 8080,
    db: 'mongodb://localhost/express-json-api-test',
    logger: {
        prefix: 'test -',
        transports: [],
        Console: {}
    }
};
