'use strict';


describe.only('Query#update', function() {

    var items;

    before(function(done) {
        localforage.create(this.items(), function(error, createdItems) {
            items = createdItems;
            done(error, createdItems);
        });
    });

    it('should be able to update items using callback style', function(done) {
        var criteria = {
            name: items[0].name
        };

        var update = {
            name: faker.name.findName()
        };

        localforage.update(criteria, update, function(error, updatedItems) {
            expect(error).to.not.exist;
            expect(updatedItems).to.exist;
            expect(updatedItems[0].name).to.equal(update.name);
            expect(updatedItems[0].name).to.not.equal(criteria.name);
            done(error, updatedItems);
        });
    });

    it('should be able to update items using deffered style', function(done) {
        var criteria = {
            name: items[1].name
        };

        var update = {
            name: faker.name.findName()
        };

        localforage.update(criteria, update).exec(function(error, updatedItems) {
            expect(error).to.not.exist;
            expect(updatedItems).to.exist;
            expect(updatedItems[0].name).to.equal(update.name);
            expect(updatedItems[0].name).to.not.equal(criteria.name);
            done(error, updatedItems);
        });
    });

    it('should be able to update items using promise style', function(done) {
        var criteria = {
            name: items[2].name
        };

        var update = {
            name: faker.name.findName()
        };

        localforage.update(criteria, update).then(function(updatedItems) {
            expect(updatedItems).to.exist;
            expect(updatedItems[0].name).to.equal(update.name);
            expect(updatedItems[0].name).to.not.equal(criteria.name);
            done(null, updatedItems);
        }).catch(done);
    });


    //TODO fix
    it('should be able to update items using specified criteria', function(done) {
        var criteria = {
            id: {
                $in: [_.map(items, '_id')]
            }
        };

        var update = {
            name: faker.name.findName()
        };

        localforage.update(criteria, update).then(function(updatedItems) {
            expect(updatedItems).to.exist;
            console.log(updatedItems.length);
            done(null, updatedItems);
        }).catch(done);
    });

    after(function(done) {
        localforage.remove({
            id: {
                $in: _.map(items, '_id')
            }
        }, done);
    });

});