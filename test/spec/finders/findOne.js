'use strict';

var person;

describe('Query#findOne', function() {

    before(function(done) {
        var _person = faker.helpers.contextualCard();
        localforage.create(_person, function(error, createdPerson) {
            person = createdPerson;
            done(error, createdPerson);
        });
    });

    it('should be able to find one item by using callback style', function(done) {
        localforage
            .findOne({
                name: person.name
            }, function(error, foundPerson) {

                expect(error).to.be.null;
                expect(foundPerson).to.exist;
                expect(foundPerson.name).to.equal(person.name);

                done();
            });
    });

    it('should be able to find one item using defer style', function(done) {
        localforage
            .findOne({
                name: person.name
            })
            .exec(function(error, foundPerson) {

                expect(error).to.be.null;
                expect(foundPerson).to.exist;
                expect(foundPerson.name).to.equal(person.name);

                done();
            });
    });

    it('should be able to find one item using promise style', function(done) {
        localforage
            .findOne({
                name: person.name
            })
            .then(function(foundPerson) {

                expect(foundPerson).to.exist;
                expect(foundPerson.name).to.equal(person.name);

                done();
            });
    });

    it('should be able to chain find one with other where clause', function(done) {
        localforage
            .findOne()
            .where('name')
            .eq(person.name)
            .then(function(foundPerson) {

                expect(foundPerson).to.exist;
                expect(foundPerson.name).to.equal(person.name);

                done();
            });
    });
    
});