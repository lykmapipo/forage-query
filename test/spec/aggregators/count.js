'use strict';

var item;

describe('Query#aggregate#count', function() {

    before(function(done) {
        var _item = this.items(1)[0];
        localforage.create(_item, function(error, createdPerson) {
            item = createdPerson;
            done(error, createdPerson);
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

                done();
            });
    });

    it('should be able to count items by specified criteria using promise style', function(done) {

        localforage
            .count({
                name: item.name
            })
            .then(function(count) {

                expect(count).to.exist;

                done();
            }).catch(function(error) {
                done(error);
            });
    });
});