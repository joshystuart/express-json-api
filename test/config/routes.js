import user from '../models/user';
import admin from '../models/admin';
import userMapper from '../models/mappers/user';
import sanitizer from '../../src/utils/sanitizer';
import * as controllers from '../../src/controllers.js';

module.exports = {
    routes: [
        {
            endpoint: '/users',
            model: user,
            mapper: userMapper,
            populate: 'company',
            limit: 20,
            id: '_id',
            methods: {
                getList: controllers.getList.default,
                patch: controllers.patch.default,
                get: controllers.get.default,
                post: controllers.post.default
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
                patch: controllers.patch.default,
                post: controllers.post.default
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
                patch: controllers.patch.default,
                post: controllers.post.default
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
