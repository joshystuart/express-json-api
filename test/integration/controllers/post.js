const should = require('should');
const q = require('q');
const app = require('../app');
const request = require('supertest');
const db = require('../../utils/db');
const User = require('../../models/user');
const logger = require('../../../src/utils/logger');

describe('Integration Tests', function() {
    describe('Controllers', function() {
        describe('Post', function() {
            before(function(done) {
                db.connect().
                then(function() {
                    return app.init();
                }).
                then(function() {
                    done();
                }).
                fail(function(err) {
                    logger.error(err);
                });
            });

            after(function(done) {
                q.all([
                    db.removeAll(User),
                ]).
                then(function() {
                    return app.stop();
                }).
                then(function() {
                    return db.disconnect();
                }).
                then(function() {
                    done();
                }).
                fail(function(err) {
                    logger.error(err);
                });
            });

            it('should create a new resource', function(done) {
                const insert = {
                    data: {
                        attributes: {
                            'first-name': 'Ada',
                            'last-name': 'Lovegood'
                        }
                    }
                };

                request(app.getExpressApplication()).
                post('/users').
                set('Content-Type', 'application/json').
                send(insert).
                expect(200).
                end(function(err, res) {
                    should.not.exist(err);
                    should.exist(res.body.data.id);
                    // data response has been transformed by serializer
                    res.body.data.name.last.should.be.equal('Lovegood');
                    res.body.data.name.first.should.be.equal('Ada');
                    done();
                });
            });

            it('should return http 400 if `attributes` are missing', function(done) {
                const insert = {
                    data: {}
                };

                request(app.getExpressApplication()).
                post('/users').
                set('Content-Type', 'application/json').
                send(insert).
                expect(400, done);
            });

            it('should sanitize all fields', function(done) {
                const insert = {
                    data: {
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>'
                        }
                    }
                };

                request(app.getExpressApplication()).
                post('/admins').
                set('Content-Type', 'application/json').
                send(insert).
                expect(200).
                end(function(err, res) {
                    should.not.exist(err);
                    should.exist(res.body.data._id);
                    res.body.data['first-name'].should.be.equal('&lt;script>Watermelon&lt;/script>');
                    res.body.data['last-name'].should.be.equal('&lt;script>alert("xss")&lt;/script>');
                    done();
                });
            });

            it('should sanitize selected fields', function(done) {
                const insert = {
                    data: {
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>'
                        }
                    }
                };

                request(app.getExpressApplication()).
                post('/users').
                set('Content-Type', 'application/json').
                send(insert).
                expect(200).
                end(function(err, res) {
                    should.not.exist(err);
                    should.exist(res.body.data.id);
                    res.body.data.name.first.should.be.equal('&lt;script>Watermelon&lt;/script>');
                    // last name should not be sanitized as per config
                    res.body.data.name.last.should.be.equal('<script>alert("xss")</script>');
                    done();
                });
            });

            it('should sanitize nested object fields', function(done) {
                const insert = {
                    data: {
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>',
                            address: {
                                state: '<script>alert("xss")</script>',
                                city: 'Atlantic'
                            }
                        }
                    }
                };

                request(app.getExpressApplication()).
                post('/admins/').
                set('Content-Type', 'application/json').
                send(insert).
                expect(200).
                end(function(err, res) {
                    should.not.exist(err);
                    res.body.data['first-name'].should.be.equal('&lt;script>Watermelon&lt;/script>');
                    res.body.data['last-name'].should.be.equal('&lt;script>alert("xss")&lt;/script>');
                    res.body.data.address.state.should.be.equal('&lt;script>alert("xss")&lt;/script>');
                    res.body.data.address.city.should.be.equal('Atlantic');
                    done();
                });
            });

            it('should sanitize nested array fields', function(done) {
                const insert = {
                    data: {
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>',
                            acls: [
                                'users:create',
                                '<script>alert("read")</script>',
                                'users:update',
                                'users:delete'
                            ]
                        }
                    }
                };

                request(app.getExpressApplication()).
                post('/admins/').
                set('Content-Type', 'application/json').
                send(insert).
                expect(200).
                end(function(err, res) {
                    should.not.exist(err);
                    res.body.data['first-name'].should.be.equal('&lt;script>Watermelon&lt;/script>');
                    res.body.data['last-name'].should.be.equal('&lt;script>alert("xss")&lt;/script>');
                    res.body.data.acls[0].should.be.equal('users:create');
                    res.body.data.acls[1].should.be.equal('&lt;script>alert("read")&lt;/script>');
                    done();
                });
            });

            it('should not sanitize when it is inactive', function(done) {
                const insert = {
                    data: {
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>'
                        }
                    }
                };

                request(app.getExpressApplication()).
                post('/managers').
                set('Content-Type', 'application/json').
                send(insert).
                expect(200).
                end(function(err, res) {
                    should.not.exist(err);
                    should.exist(res.body.data._id);
                    res.body.data['first-name'].should.be.equal('<script>Watermelon</script>');
                    res.body.data['last-name'].should.be.equal('<script>alert("xss")</script>');
                    done();
                });
            });
        });
    });
});
