/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import path from 'path';
const env = process.env.NODE_ENV || 'development';
const config = require('./env/' + env);

config.root = path.normalize(__dirname + '/..');

export default config;
