'use strict';

describe('Query#findById', function() {

    var item;

    before(function(done) {
        localforage.create(this.items(1), function(error, createdItem) {
            item = createdItem;
            done(error, createdItem);
        });
    });

    it('should be able to find an item by its id using callback style', function(done) {
        localforage.findById(item.id, function(error, foundItem) {

            expect(error).to.be.null;
            expect(foundItem).to.exist;
            expect(foundItem.name).to.equal(item.name);

            done(error, foundItem);
        });
    });

    it('should be able to find an item by its id using defer style', function(done) {
        localforage.findById(item.id).exec(function(error, foundItem) {

            expect(error).to.be.null;
            expect(foundItem).to.exist;
            expect(foundItem.name).to.equal(item.name);

            done(error, foundItem);
        });
    });

    it('should be able to find an item by its id using promise style', function(done) {
        localforage.findById(item.id).then(function(foundItem) {

            expect(foundItem).to.exist;
            expect(foundItem.name).to.equal(item.name);

            done(null, foundItem);
        }).catch(done);
    });

    after(function(done) {
        localforage.remove({
            id: item.id
        }, done);
    });

});