'use strict';

var person;

describe('Query#where', function() {

    before(function(done) {
        var _person = faker.helpers.contextualCard();
        localforage.create(_person, function(error, createdPerson) {
            person = createdPerson;
            done(error, createdPerson);
        });
    });

    it('should be able to find an item using where criteria', function(done) {
        localforage
            .where({
                name: person.name,
                email: person.email
            })
            .exec(function(error, people) {

                expect(error).to.be.null;
                expect(people).to.exist;
                expect(people[0].name).to.equal(person.name);

                done();
            });
    });
    
});