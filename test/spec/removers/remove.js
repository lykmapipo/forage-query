'use strict';

var items;

describe('Query#remove', function() {

    before(function(done) {
        localforage.create(this.items(), function(error, createdItems) {
            console.log('called');
            items = createdItems;
            done(error, createdItems);
        });
    });

    it('should be able to remove items using callback style', function(done) {
        var criteria = {
            name: items[0].name
        };

        localforage.remove(criteria, function(error, removedItems) {
            expect(error).to.not.exist;
            expect(removedItems).to.exist;
            done(error, removedItems);
        });
    });

    it('should be able to remove items using deffered style', function(done) {
        var criteria = {
            name: items[1].name
        };

        localforage.remove(criteria).exec(function(error, removedItems) {
            expect(error).to.not.exist;
            expect(removedItems).to.exist;
            done(error, removedItems);
        });
    });

    it('should be able to remove items using promise style', function(done) {
        var criteria = {
            name: items[2].name
        };

        localforage.remove(criteria).then(function(removedItems) {
            expect(removedItems).to.exist;
            done(null, removedItems);
        }).catch(function(error) {
            done(error);
        });
    });

    after(function(done) {
        localforage.remove(done);
    });

});