'use strict';


describe('Query#findByIdAndUpdate', function() {

    var items;

    before(function(done) {
        localforage.create(this.items(), function(error, createdItems) {
            items = createdItems;
            done(error, createdItems);
        });
    });

    it('should be able to remove an item using callback style', function(done) {
        var update = {
            name: faker.name.findName()
        };

        localforage.findByIdAndUpdate(items[0].id, update, function(error, updatedItem) {
            expect(error).to.not.exist;
            expect(updatedItem).to.exist;
            expect(updatedItem.name).to.equal(update.name);
            expect(updatedItem.id).to.equal(items[0].id);
            expect(updatedItem.name).to.not.equal(items[0].name);
            done(error, updatedItem);
        });
    });

    it('should be able to remove items using deffered style', function(done) {
        var update = {
            name: faker.name.findName()
        };

        localforage.findByIdAndUpdate(items[1].id, update).exec(function(error, updatedItem) {
            expect(error).to.not.exist;
            expect(updatedItem).to.exist;
            expect(updatedItem.name).to.equal(update.name);
            expect(updatedItem.id).to.equal(items[1].id);
            expect(updatedItem.name).to.not.equal(items[1].name);
            done(error, updatedItem);
        });
    });

    it('should be able to remove items using promise style', function(done) {
        var update = {
            name: faker.name.findName()
        };
        localforage.findByIdAndUpdate(items[2].id, update).then(function(updatedItem) {
            expect(updatedItem).to.exist;
            expect(updatedItem.name).to.equal(update.name);
            expect(updatedItem.id).to.equal(items[2].id);
            expect(updatedItem.name).to.not.equal(items[2].name);
            done(null, updatedItem);
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