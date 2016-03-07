/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import mongoose from 'mongoose';
import User from './user';
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
