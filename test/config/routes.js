const user = require('../models/user');
const admin = require('../models/admin');
const userMapper = require('../models/mappers/user');
const sanitizer = require('../../src/utils/sanitizer');
import * as controllers from '../../src/controllers.js';

module.exports = {
    routes: [
        {
            endpoint: '/users',
            model: user,
            mapper: userMapper,
            limit: 20,
            id: '_id',
            methods: {
                getList: controllers.getList.default,
                patch: controllers.patch.default,
                get: controllers.get.default
            },
            search: {
                active: true,
                fields: ['first-name']
            },
            sanitize: {
                active: true,
                fields: ['first-name'],
                method: sanitizer
            }
        },
        {
            endpoint: '/admins',
            model: admin,
            limit: 20,
            id: '_id',
            methods: {
                getList: controllers.getList.default,
                patch: controllers.patch.default
            },
            search: {
                active: false
            },
            sanitize: {
                active: true
            }
        },
        {
            endpoint: '/managers',
            model: admin,
            limit: 20,
            id: '_id',
            methods: {
                patch: controllers.patch.default
            },
            search: {
                active: false
            },
            sanitize: {
                active: false
            }
        }
    ]
};
