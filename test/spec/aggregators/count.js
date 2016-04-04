'use strict';


describe('Query#aggregate#count', function() {

    var items;
    var item;

    before(function(done) {
        localforage.create(this.items(), function(error, createdItems) {
            items = createdItems;
            item = createdItems[0];
            done(error, createdItems);
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
            _id: {
                $in: _.map(items, '_id')
            }
        }, function(error, count) {

            expect(error).to.not.exist;
            expect(count).to.exist;
            expect(count).to.be.equal(5);

            done(error, count);
        });
    });

    it('should be able to count items by specified criteria using defer style', function(done) {

        localforage.count({
                _id: {
                    $in: _.map(items, '_id')
                }
            })
            .exec(function(error, count) {

                expect(error).to.be.null;
                expect(count).to.exist;
                expect(count).to.be.equal(5);

                done(null, count);
            });
    });

    it('should be able to count items by specified criteria using promise style', function(done) {

        localforage.count({
                _id: {
                    $in: _.map(items, '_id')
                }
            })
            .then(function(count) {

                expect(count).to.exist;
                expect(count).to.be.equal(5);

                done(null, count);
            }).catch(done);
    });

    after(function(done) {
        localforage.remove({
            _id: {
                $in: _.map(items, '_id')
            }
        }, done);
    });

});