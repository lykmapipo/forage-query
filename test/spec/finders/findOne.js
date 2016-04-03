'use strict';

describe('Query#findOne', function() {

    var item;

    before(function(done) {
        localforage.create(this.items(1), function(error, createdItem) {
            item = createdItem;
            done(error, createdItem);
        });
    });

    it('should be able to find one item by using callback style', function(done) {
        localforage
            .findOne({
                name: item.name
            }, function(error, foundItem) {

                expect(error).to.be.null;
                expect(foundItem).to.exist;
                expect(foundItem.name).to.equal(item.name);

                done(error, foundItem);
            });
    });

    it('should be able to find one item using defer style', function(done) {
        localforage
            .findOne({
                name: item.name
            })
            .exec(function(error, foundItem) {

                expect(error).to.be.null;
                expect(foundItem).to.exist;
                expect(foundItem.name).to.equal(item.name);

                done(error, foundItem);
            });
    });

    it('should be able to find one item using promise style', function(done) {
        localforage
            .findOne({
                name: item.name
            })
            .then(function(foundItem) {

                expect(foundItem).to.exist;
                expect(foundItem.name).to.equal(item.name);

                done(null, foundItem);
            }).catch(done);
    });

    it('should be able to chain find one with other where clause', function(done) {
        localforage
            .findOne()
            .where('name')
            .eq(item.name)
            .then(function(foundItem) {

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