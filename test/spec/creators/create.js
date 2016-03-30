'use strict';

describe('Query#create', function() {

    it('should be a function', function(done) {
        expect(localforage.create).to.be.a('function');
        expect(localforage.insert).to.be.a('function');
        done();
    });

    describe('simple item', function() {

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

    describe('batch items', function() {
        
        it('should be able to create items using callback style', function(done) {
            var people = this.items(2);

            localforage.create(people, function(error, createdPeople) {

                expect(error).to.be.null;
                expect(createdPeople).to.exist;
                expect(createdPeople[0].id).to.exist;
                expect(createdPeople[0]._id).to.exist;
                expect(createdPeople[1].id).to.exist;
                expect(createdPeople[1]._id).to.exist;
                expect(createdPeople[0].name).to.equal(people[0].name);
                expect(createdPeople[1].name).to.equal(people[1].name);

                done(error, createdPeople);
            });
        });

        it('should be able to create items using defer style', function(done) {
            var people = this.items(2);

            localforage
                .create(people)
                .exec(function(error, createdPeople) {

                    expect(error).to.be.null;
                    expect(createdPeople).to.exist;
                    expect(createdPeople[0].id).to.exist;
                    expect(createdPeople[0]._id).to.exist;
                    expect(createdPeople[1].id).to.exist;
                    expect(createdPeople[1]._id).to.exist;
                    expect(createdPeople[0].name).to.equal(people[0].name);
                    expect(createdPeople[1].name).to.equal(people[1].name);

                    done(error, createdPeople);
                });
        });

        it('should be able to create items using promise style', function(done) {
            var people = this.items(2);

            localforage
                .create(people)
                .then(function(createdPeople) {

                    expect(createdPeople).to.exist;
                    expect(createdPeople[0].id).to.exist;
                    expect(createdPeople[0]._id).to.exist;
                    expect(createdPeople[1].id).to.exist;
                    expect(createdPeople[1]._id).to.exist;
                    expect(createdPeople[0].name).to.equal(people[0].name);
                    expect(createdPeople[1].name).to.equal(people[1].name);

                    done(null, createdPeople);

                }).catch(function(error) {
                    done(error);
                });
        });

    });

});