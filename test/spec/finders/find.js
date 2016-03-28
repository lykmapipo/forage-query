'use strict';

var person;

describe('Query#find', function() {
    before(function(done) {

        var _person = faker.helpers.contextualCard();

        localforage.create(_person, function(error, createdPerson) {
            person = createdPerson;
            done(error, createdPerson);
        });
    });

    it('should be able to find an item by its id using callback style', function(done) {

        localforage.find({
            id: person.id
        }, function(error, foundPerson) {

            expect(error).to.be.null;
            expect(foundPerson).to.exist;
            expect(foundPerson.name).to.equal(person.name);

            done(error, foundPerson);
        });
    });

    it('should be able to find an item by its id using defer style', function(done) {

        localforage
            .find({
                id: person.id
            })
            .exec(function(error, foundPerson) {

                expect(error).to.be.null;
                expect(foundPerson).to.exist;
                expect(foundPerson.name).to.equal(person.name);

                done();
            });
    });

    it('should be able to find an item by its id using promise style', function(done) {

        localforage
            .find({
                id: person.id
            })
            .then(function(foundPerson) {

                expect(foundPerson).to.exist;
                expect(foundPerson.name).to.equal(person.name);

                done();
            });
    });
});