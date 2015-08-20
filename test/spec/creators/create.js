'use strict';

describe('Query#create', function() {

    it('should be a function', function(done) {
        expect(Query.prototype.create).to.be.a('function');
        done();
    });

    it('should be able to create an item using callback style', function(done) {
        var query = new Query();

        var person = faker.helpers.contextualCard();

        query.create(person, function(error, createdPerson) {

            expect(error).to.be.null;
            expect(createdPerson).to.exist;
            expect(createdPerson.id).to.exist;
            expect(createdPerson.name).to.equal(person.name);

            done();
        });
    });


    it('should be able to create an item using defer style', function(done) {
        var query = new Query();

        var person = faker.helpers.contextualCard();

        query
            .create(person)
            .exec(function(error, createdPerson) {

                expect(error).to.be.null;
                expect(createdPerson).to.exist;
                expect(createdPerson.id).to.exist;
                expect(createdPerson.name).to.equal(person.name);

                done();
            });
    });


    it('should be able to create an item using promise style', function(done) {
        var query = new Query();

        var person = faker.helpers.contextualCard();

        query
            .create(person)
            .then(function(createdPerson) {

                expect(createdPerson).to.exist;
                expect(createdPerson.id).to.exist;
                expect(createdPerson.name).to.equal(person.name);

                done();
            });
    });

});