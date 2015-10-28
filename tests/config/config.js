/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
var path = require('path');
var env = process.env.NODE_ENV || 'development';
var config = require('./env/' + env);

config.root = path.normalize(__dirname + '/..');

module.exports = config;
