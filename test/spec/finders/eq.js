'use strict';

var person;

describe('Query#where#eq', function() {
    before(function(done) {
        var query = new Query();

        var _person = faker.helpers.contextualCard();

        query.create(_person, function(error, createdPerson) {
            person = createdPerson;
            done(error, createdPerson);
        });
    });

    it('should be able to use simple path to build query condition', function(done) {
        var query = new Query();

        query
            .where('name').eq(person.name)
            .where('email').equals(person.email)
            .exec(function(error, people) {

                expect(error).to.be.null;
                expect(people).to.exist;
                expect(people[0].name).to.equal(person.name);

                done();
            });
    });

    it('should be able to use nested path to build query condition', function(done) {
        var query = new Query();

        query
            .where('address.street')
            .eq(person.address.street)
            .exec(function(error, people) {

                expect(error).to.be.null;
                expect(people).to.exist;
                expect(people[0].name).to.equal(person.name);

                done();
            });
    });
});