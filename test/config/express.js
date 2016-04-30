/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import ExpressJsonApi from '../../src/express-json-api-service';
import routesConfig from './routes';

module.exports = (app) => {
    const env = process.env.NODE_ENV || 'development';
    let expressJsonApi; // eslint-disable-line no-unused-vars

    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env === 'development';

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(compress());
    app.use(methodOverride());

    expressJsonApi = new ExpressJsonApi(app, routesConfig);

    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    /**
     * In development environments display 500 errors.
     */
    if (app.get('env') === 'development') {
        app.use((err, req, res) => {
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: err,
                title: 'error'
            });
        });
    }

    /**
     * In production environments do not display the 500 errors.
     */

    app.use((err, req, res) => {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: {},
            title: 'error'
        });
    });
};
