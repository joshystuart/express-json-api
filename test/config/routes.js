const user = require('../models/user');
const admin = require('../models/admin');
const userMapper = require('../models/mappers/user');
const get = require('../../src/controllers/get');
const getList = require('../../src/controllers/get-list');
const patch = require('../../src/controllers/patch');
const sanitizer = require('../../src/utils/sanitizer');

module.exports = {
    routes: [
        {
            endpoint: '/users',
            model: user,
            mapper: userMapper,
            limit: 20,
            id: '_id',
            methods: {
                getList: getList.default,
                patch: patch.default,
                get: get.default
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
                getList: getList.default,
                patch: patch.default
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
                patch: patch.default
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
