import Company from '../../models/company';
import companies from '../../fixtures/companies.json';
import 'should';

describe('Models - Company', () => {
    before((done) => {
        done();
    });

    after((done) => {
        done();
    });

    it('should contain all valid company fields', (done) => {
        const company = new Company(companies[0]);

        company['created-on'].should.eql(new Date('2015-10-22T02:54:12.657Z'));
        company['legal-name'].should.eql('Alphabet Inc.');
        company.name.should.eql('Google');

        done();
    });
});
