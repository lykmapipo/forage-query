'use strict';

var items;

describe('Query#remove', function() {

    beforeEach(function(done) {
        localforage.create(this.items, function(error, createdItems) {
            items = createdItems;
            done(error, createdItems);
        });
    });

    it('should be able to remove items using callback style', function(done) {
        localforage.remove(function(error, removedItems) {
            expect(error).to.not.exist;
            expect(removedItems).to.exist;
            done(error, removedItems);
        });
    });

    it('should be able to remove items using deffered style', function(done) {
        localforage.remove().exec(function(error, removedItems) {
            expect(error).to.not.exist;
            expect(removedItems).to.exist;
            done(error, removedItems);
        });
    });

    it('should be able to remove items using promise style', function(done) {
        localforage.remove().then(function(removedItems) {
            expect(removedItems).to.exist;
            done(null, removedItems);
        }).catch(function(error) {
            done(error);
        });
    });


    it('should be able to remove items using specified criteria', function(done) {
        var criteria = {
            name: this.items[1].name
        };

        localforage.remove(criteria, function(error, removedItems) {
            expect(error).to.not.exist;
            expect(removedItems).to.exist;
            expect(removedItems).to.have.length(1);
            done(error, removedItems);
        });
    });

});