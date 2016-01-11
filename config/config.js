/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

import path from 'path';
import development from './env/development.js';
import production from './env/production.js';
import test from './env/test.js';
const env = process.env.NODE_ENV || 'development';

// set up all configs in an object
const configs = {
    development: development,
    production: production,
    test: test
};

// select the correct config using the environment variable, else, use the development config.
const config = configs[env] || development;

config.root = path.normalize(__dirname + '/..');

export default config;
