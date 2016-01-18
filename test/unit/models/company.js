const Company = require('../../models/company');
const companies = require('../../fixtures/companies.json');
require('should');

describe('Models - Company', function() {
    before(function(done) {
        done();
    });

    after(function(done) {
        done();
    });

    it('should contain all valid company fields', function(done) {
        const company = new Company(companies[0]);

        company['created-on'].should.eql(new Date('2015-10-22T02:54:12.657Z'));
        company['legal-name'].should.eql('Alphabet Inc.');
        company.name.should.eql('Google');

        done();
    });
});
