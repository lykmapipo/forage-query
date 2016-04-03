'use strict';



describe('Query#create', function() {
    //reference
    var items = [];

    function collect(item) {
        item = _.isArray(item) ? item : [item]
        items = items.concat(item);
    }

    it('should be a function', function(done) {
        expect(localforage.create).to.be.a('function');
        expect(localforage.insert).to.be.a('function');
        done();
    });

    describe('simple item', function() {

        it('should be able to create an item using callback style', function(done) {
            var item = this.items(1);

            localforage.create(item, function(error, createdItem) {

                expect(error).to.be.null;
                expect(createdItem).to.exist;
                expect(createdItem.id).to.exist;
                expect(createdItem._id).to.exist;
                expect(createdItem.name).to.equal(item.name);

                collect(createdItem);

                done(error, createdItem);
            });
        });


        it('should be able to create an item using defer style', function(done) {
            var item = this.items(1);

            localforage
                .create(item)
                .exec(function(error, createdItem) {

                    expect(error).to.be.null;
                    expect(createdItem).to.exist;
                    expect(createdItem.id).to.exist;
                    expect(createdItem._id).to.exist;
                    expect(createdItem.name).to.equal(item.name);

                    collect(createdItem);

                    done(error, createdItem);
                });
        });


        it('should be able to create an item using promise style', function(done) {
            var item = this.items(1);

            localforage
                .create(item)
                .then(function(createdItem) {

                    expect(createdItem).to.exist;
                    expect(createdItem.id).to.exist;
                    expect(createdItem._id).to.exist;
                    expect(createdItem.name).to.equal(item.name);

                    collect(createdItem);

                    done();
                });
        });

    });

    describe('batch items', function() {

        it('should be able to create items using callback style', function(done) {
            var items = this.items(2);

            localforage.create(items, function(error, createdItems) {

                expect(error).to.be.null;
                expect(createdItems).to.exist;
                expect(createdItems[0].id).to.exist;
                expect(createdItems[0]._id).to.exist;
                expect(createdItems[1].id).to.exist;
                expect(createdItems[1]._id).to.exist;
                expect(createdItems[0].name).to.equal(items[0].name);
                expect(createdItems[1].name).to.equal(items[1].name);

                collect(createdItems);

                done(error, createdItems);
            });
        });

        it('should be able to create items using defer style', function(done) {
            var items = this.items(2);

            localforage
                .create(items)
                .exec(function(error, createdItems) {

                    expect(error).to.be.null;
                    expect(createdItems).to.exist;
                    expect(createdItems[0].id).to.exist;
                    expect(createdItems[0]._id).to.exist;
                    expect(createdItems[1].id).to.exist;
                    expect(createdItems[1]._id).to.exist;
                    expect(createdItems[0].name).to.equal(items[0].name);
                    expect(createdItems[1].name).to.equal(items[1].name);

                    collect(createdItems);

                    done(error, createdItems);
                });
        });

        it('should be able to create items using promise style', function(done) {
            var items = this.items(2);

            localforage
                .create(items)
                .then(function(createdItems) {

                    expect(createdItems).to.exist;
                    expect(createdItems[0].id).to.exist;
                    expect(createdItems[0]._id).to.exist;
                    expect(createdItems[1].id).to.exist;
                    expect(createdItems[1]._id).to.exist;
                    expect(createdItems[0].name).to.equal(items[0].name);
                    expect(createdItems[1].name).to.equal(items[1].name);

                    collect(createdItems);

                    done(null, createdItems);

                }).catch(function(error) {
                    done(error);
                });
        });

    });

    after(function(done) {
        var ids = _.compact(_.map(items, '_id'));

        localforage.remove({
            id: {
                $in: ids
            }
        }, done);
    });

});