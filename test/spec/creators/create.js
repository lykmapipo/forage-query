'use strict';

describe('Query#create', function() {

    it('should be a function', function(done) {
        expect(localforage.create).to.be.a('function');
        expect(localforage.insert).to.be.a('function');
        done();
    });

    it('should be able to create an item using callback style', function(done) {
        var person = faker.helpers.contextualCard();

        localforage.create(person, function(error, createdPerson) {

            expect(error).to.be.null;
            expect(createdPerson).to.exist;
            expect(createdPerson.id).to.exist;
            expect(createdPerson._id).to.exist;
            expect(createdPerson.name).to.equal(person.name);

            done(error, createdPerson);
        });
    });


    it('should be able to create an item using defer style', function(done) {
        var person = faker.helpers.contextualCard();

        localforage
            .create(person)
            .exec(function(error, createdPerson) {

                expect(error).to.be.null;
                expect(createdPerson).to.exist;
                expect(createdPerson.id).to.exist;
                expect(createdPerson._id).to.exist;
                expect(createdPerson.name).to.equal(person.name);

                done(error, createdPerson);
            });
    });


    it('should be able to create an item using promise style', function(done) {
        var person = faker.helpers.contextualCard();

        localforage
            .create(person)
            .then(function(createdPerson) {

                expect(createdPerson).to.exist;
                expect(createdPerson.id).to.exist;
                expect(createdPerson._id).to.exist;
                expect(createdPerson.name).to.equal(person.name);

                done();
            });
    });

});