const user = require('../models/user');
const userMapper = require('../models/mappers/user');

module.exports = {
    routes: [
        {
            endpoint: '/users',
            model: user,
            limit: 20,
            id: '_id',
            methods: ['patch'],
            mapper: userMapper
        }
    ]
};
