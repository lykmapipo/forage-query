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

    it('should be able to find an item using where#eq criteria builder', function(done) {
        var query = new Query();

        query
            .where('name').eq(person.name)
            .where('email').eq(person.email)
            .exec(function(error, foundPerson) {

                expect(error).to.be.null;
                expect(foundPerson).to.exist;
                expect(foundPerson.name).to.equal(person.name);

                done();
            });
    });
});