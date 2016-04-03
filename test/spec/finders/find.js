'use strict';

describe('Query#find', function() {

    var items;
    var item;

    before(function(done) {
        localforage.create(this.items(), function(error, createdItems) {
            items = createdItems;
            item = items[0];
            done(error, createdItems);
        });
    });

    it('should be able to find an item by its id using callback style', function(done) {

        localforage.find({
            id: item.id
        }, function(error, foundItem) {

            expect(error).to.be.null;
            expect(foundItem).to.exist;
            expect(foundItem.name).to.equal(item.name);

            done(error, foundItem);
        });
    });

    it('should be able to find an item by its id using defer style', function(done) {

        localforage
            .find({
                id: item.id
            })
            .exec(function(error, foundItem) {

                expect(error).to.be.null;
                expect(foundItem).to.exist;
                expect(foundItem.name).to.equal(item.name);

                done();
            });
    });

    it('should be able to find an item by its id using promise style', function(done) {

        localforage
            .find({
                id: item.id
            })
            .then(function(foundItem) {

                expect(foundItem).to.exist;
                expect(foundItem.name).to.equal(item.name);

                done();
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