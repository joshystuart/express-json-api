/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */
import _ from 'lodash';
import logger from '../utils/logger.js';

/**
 * An abstract controller that contains common methods for all RESTful controllers.
 */
class AbstractController {
    static setModelNotFoundException(next) {
        this.setException(500, `Target Model Not Found`, next);
    }

    static setException(status, message, next) {
        const err = new Error(message);
        logger.error(message);
        err.status = status;
        next(err);
    }

    /**
     * If a serializer is provided, the data is mapped from the model structure, to the provided response structure.
     *
     * // TODO make it asynchronous.
     *
     * @param req
     * @param res
     * @param next
     */
    static serialize(req, res, next) {
        const mapper = res.locals.mapper;

        // if there's a custom mapper / serializer
        if (!!mapper && typeof mapper.serialize === 'function') {
            const serializedResults = [];

            // if we have multiple resources
            if (!!res.locals.resources) {
                _.forEach(res.locals.resources, (model) => {
                    serializedResults.push(mapper.serialize(model));
                });

                res.locals.resources = serializedResults;

                next();
            } else if (!!res.locals.resource) {
                // if we have a single resource
                res.locals.resource = mapper.serialize(res.locals.resource);

                next();
            } else {
                next();
            }
        } else {
            // if it's not a lean query we have to convert all resources back to objects.
            if (!res.locals.lean) {
                if (!!res.locals.resources && res.locals.resources.length > 0 && !!res.locals.resources[0].toObject) {
                    res.locals.resources = _.map(res.locals.resources, (resource) => {
                        return resource.toObject();
                    });
                } else if (!!res.locals.resource && !!res.locals.resource.toObject) {
                    res.locals.resource = res.locals.resource.toObject();
                }
            }

            next();
        }
    }
}

export default AbstractController;
