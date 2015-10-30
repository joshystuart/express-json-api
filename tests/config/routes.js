const user = require('../models/user');
const userMapper = require('../models/mappers/user');
const getList = require('../../src/controllers/get-list');
const patch = require('../../src/controllers/patch');

module.exports = {
    routes: [
        {
            endpoint: '/users',
            model: {
                schema: user,
                mapper: userMapper
            },
            limit: 20,
            id: '_id',
            methods: {
                getList: getList.default,
                patch: patch.default
            },
            search: {
                active: true,
                fields: ['first-name']
            }
        }
    ]
};
