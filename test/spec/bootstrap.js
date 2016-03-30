'use strict';

//extend localForage with query capabilities
before(function(done) {
	// Force localStorage to be the backend driver.
	localforage.setDriver(localforage.LOCALSTORAGE);

	//pass localforage instance to be extended
	Query.extend(localforage);

	done();
});

//prepare seeds
before(function(done) {
	this.items = [];

	for (var i = 0; i < 5; i++) {
		this.items.push(faker.helpers.contextualCard());
	}

	done();
});

//clear localforage
before(function(done) {
	localforage.clear(done);
});

//clear localforage
after(function(done) {
	localforage.clear(done);
});