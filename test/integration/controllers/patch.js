import q from 'q';
import app from '../app';
import should from 'should';
import request from 'supertest';
import db from '../../utils/db';
import logger from '../../../src/utils/logger';

import User from '../../models/user';
import Admin from '../../models/admin';
import Company from '../../models/company';

import users from '../../fixtures/users.json';
import admins from '../../fixtures/admins.json';
import companies from '../../fixtures/companies.json';

describe('Integration Tests', () => {
    describe('Controllers', () => {
        describe('Patch', () => {
            before((done) => {
                db.connect().
                then(() => {
                    return q.all([
                        db.import(User, users),
                        db.import(Admin, admins),
                        db.import(Company, companies)
                    ]);
                }).
                then(() => {
                    return app.init();
                }).
                then(() => {
                    done();
                }).
                fail((err) => {
                    logger.error(err);
                });
            });

            after((done) => {
                q.all([
                    db.removeAll(User),
                    db.removeAll(Admin),
                    db.removeAll(Company)
                ]).
                then(() => {
                    return app.stop();
                }).
                then(() => {
                    return db.disconnect();
                }).
                then(() => {
                    done();
                }).
                fail((err) => {
                    logger.error(err);
                });
            });

            it('should update an existing resource', (done) => {
                const id = users[3]._id;
                const updates = {
                    data: {
                        id: id,
                        attributes: {
                            'last-name': 'Lovegood'
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/users/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(200).
                end((err, res) => {
                    should.not.exist(err);

                    // data response has been transformed by serializer
                    res.body.data.name.last.should.be.equal('Lovegood');
                    res.body.data.name.first.should.be.equal('Ada');
                    done();
                });
            });

            it('should update an existing resource and populate result', (done) => {
                const id = users[0]._id;
                const updates = {
                    data: {
                        id: id,
                        attributes: {
                            'last-name': 'Brian'
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/users/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(200).
                end((err, res) => {
                    should.not.exist(err);

                    // data response has been transformed by serializer
                    res.body.data.name.last.should.be.equal('Brian');
                    res.body.data.name.first.should.be.equal('Sergey');
                    res.body.data.company.name.should.be.equal('Google');
                    done();
                });
            });

            it('should return http 404 when updating a missing record', (done) => {
                const id = '5630743e2446a0672a4ee793';
                const updates = {
                    data: {
                        id: id,
                        attributes: {
                            'last-name': 'this should fail'
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/users/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(404, done);
            });

            it('should return http 400 if `attributes` are missing', (done) => {
                const id = users[0]._id;
                const updates = {
                    data: {
                        id: id,
                        meta: {
                            stuff: 'this should fail'
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/users/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(400, done);
            });

            it('should return http 400 if `id` is missing', (done) => {
                const id = users[0]._id;
                const updates = {
                    data: {
                        meta: {
                            stuff: 'this should fail'
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/users/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(400, done);
            });

            it('should sanitize all fields', (done) => {
                const id = admins[0]._id;
                const updates = {
                    data: {
                        id: id,
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>'
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/admins/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(200).
                end((err, res) => {
                    should.not.exist(err);
                    res.body.data['first-name'].should.be.equal('&lt;script>Watermelon&lt;/script>');
                    res.body.data['last-name'].should.be.equal('&lt;script>alert("xss")&lt;/script>');
                    done();
                });
            });

            it('should sanitize selected fields', (done) => {
                const id = users[0]._id;
                const updates = {
                    data: {
                        id: id,
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>'
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/users/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(200).
                end((err, res) => {
                    should.not.exist(err);
                    res.body.data.name.first.should.be.equal('&lt;script>Watermelon&lt;/script>');
                    // last name should not be sanitized as per config
                    res.body.data.name.last.should.be.equal('<script>alert("xss")</script>');
                    done();
                });
            });

            it('should sanitize object fields', (done) => {
                const id = admins[0]._id;
                const updates = {
                    data: {
                        id: id,
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
                patch('/admins/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(200).
                end((err, res) => {
                    should.not.exist(err);
                    res.body.data['first-name'].should.be.equal('&lt;script>Watermelon&lt;/script>');
                    res.body.data['last-name'].should.be.equal('&lt;script>alert("xss")&lt;/script>');
                    res.body.data.address.state.should.be.equal('&lt;script>alert("xss")&lt;/script>');
                    res.body.data.address.city.should.be.equal('Atlantic');
                    done();
                });
            });

            it('should sanitize array fields', (done) => {
                const id = admins[0]._id;
                const updates = {
                    data: {
                        id: id,
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
                patch('/admins/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(200).
                end((err, res) => {
                    should.not.exist(err);
                    res.body.data['first-name'].should.be.equal('&lt;script>Watermelon&lt;/script>');
                    res.body.data['last-name'].should.be.equal('&lt;script>alert("xss")&lt;/script>');
                    res.body.data.acls[0].should.be.equal('users:create');
                    res.body.data.acls[1].should.be.equal('&lt;script>alert("read")&lt;/script>');
                    done();
                });
            });

            it('should sanitize nested fields', (done) => {
                const id = admins[0]._id;
                const updates = {
                    data: {
                        id: id,
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>',
                            addresses: [
                                {
                                    line1: '255 Spear Street',
                                    city: 'San Francisco',
                                    state: 'CA',
                                    postcode: '<script>alert("94105")</script>',
                                    country: 'USA'
                                }
                            ]
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/admins/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(200).
                end((err, res) => {
                    should.not.exist(err);
                    res.body.data['first-name'].should.be.equal('&lt;script>Watermelon&lt;/script>');
                    res.body.data['last-name'].should.be.equal('&lt;script>alert("xss")&lt;/script>');
                    res.body.data.addresses[0].line1.should.be.equal('255 Spear Street');
                    res.body.data.addresses[0].postcode.should.be.equal('&lt;script>alert("94105")&lt;/script>');
                    done();
                });
            });

            it('should not sanitize boolean fields', (done) => {
                const id = admins[0]._id;
                const updates = {
                    data: {
                        id: id,
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>',
                            active: true
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/managers/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(200).
                end((err, res) => {
                    should.not.exist(err);
                    res.body.data['first-name'].should.be.equal('<script>Watermelon</script>');
                    res.body.data['last-name'].should.be.equal('<script>alert("xss")</script>');
                    res.body.data.active.should.not.be.equal('true');
                    res.body.data.active.should.be.equal(true);
                    done();
                });
            });

            it('should not sanitize numeric fields', (done) => {
                const id = admins[0]._id;
                const updates = {
                    data: {
                        id: id,
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>',
                            age: 24
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/managers/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(200).
                end((err, res) => {
                    should.not.exist(err);
                    res.body.data['first-name'].should.be.equal('<script>Watermelon</script>');
                    res.body.data['last-name'].should.be.equal('<script>alert("xss")</script>');
                    res.body.data.active.should.not.be.equal('24');
                    res.body.data.age.should.be.equal(24);
                    done();
                });
            });

            it('should not sanitize when it is inactive', (done) => {
                const id = admins[0]._id;
                const updates = {
                    data: {
                        id: id,
                        attributes: {
                            'first-name': '<script>Watermelon</script>',
                            'last-name': '<script>alert("xss")</script>'
                        }
                    }
                };

                request(app.getExpressApplication()).
                patch('/managers/' + id).
                set('Content-Type', 'application/json').
                send(updates).
                expect(200).
                end((err, res) => {
                    should.not.exist(err);
                    res.body.data['first-name'].should.be.equal('<script>Watermelon</script>');
                    res.body.data['last-name'].should.be.equal('<script>alert("xss")</script>');
                    done();
                });
            });
        });
    });
});
