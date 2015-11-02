/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;

function Admin() {
    const AdminSchema = User.discriminator(
        'Admin',
        new Schema(
            {
                acls: [String]
            },
            {
                collection: 'users',
                discriminatorKey: 'role'
            }
        )
    );

    return AdminSchema;
}

module.exports = new Admin();
