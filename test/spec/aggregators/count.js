'use strict';


describe('Query#aggregate#count', function() {

    var item;

    before(function(done) {
        localforage.create(this.items(1), function(error, createdItem) {
            item = createdItem;
            done(error, createdItem);
        });
    });

    it('should be able to count all items', function(done) {
        localforage.count(function(error, count) {
            expect(error).to.not.exist;
            expect(count).to.exist;
            done(error, count);
        });
    });

    it('should be able to count items by specified criteria using callback style', function(done) {

        localforage.count({
            name: item.name
        }, function(error, count) {

            expect(error).to.not.exist;
            expect(count).to.exist;

            done(error, count);
        });
    });

    it('should be able to count items by specified criteria using defer style', function(done) {

        localforage
            .count({
                name: item.name
            })
            .exec(function(error, count) {

                expect(error).to.be.null;
                expect(count).to.exist;

                done(null, count);
            });
    });

    it('should be able to count items by specified criteria using promise style', function(done) {

        localforage
            .count({
                name: item.name
            })
            .then(function(count) {

                expect(count).to.exist;

                done(null, count);
            }).catch(done);
    });

    after(function(done) {
        localforage.remove({
            id: item.id
        }, done);
    });

});