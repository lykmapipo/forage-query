'use strict';

describe('Query#findOneAndRemove', function() {

    var items;

    before(function(done) {
        localforage.create(this.items(), function(error, createdItems) {
            items = createdItems;
            done(error, createdItems);
        });
    });

    it('should be able to remove an item using callback style', function(done) {
        localforage.findOneAndRemove({
            name: items[0].name
        }, function(error, removedItem) {
            expect(error).to.not.exist;
            expect(removedItem).to.exist;
            expect(removedItem.name).to.be.equal(items[0].name);
            done(error, removedItem);
        });
    });

    it('should be able to remove items using deffered style', function(done) {
        localforage.findOneAndRemove({
            name: items[1].name
        }).exec(function(error, removedItem) {
            expect(error).to.not.exist;
            expect(removedItem).to.exist;
            expect(removedItem.name).to.be.equal(items[1].name);
            done(error, removedItem);
        });
    });

    it('should be able to remove items using promise style', function(done) {
        localforage.findOneAndRemove({
            name: items[2].name
        }).then(function(removedItem) {
            expect(removedItem).to.exist;
            expect(removedItem.name).to.be.equal(items[2].name);
            done(null, removedItem);
        }).catch(function(error) {
            done(error);
        });
    });

    after(function(done) {
        localforage.remove({
            id: {
                $in: _.map(items, '_id')
            }
        }, done);
    });

});