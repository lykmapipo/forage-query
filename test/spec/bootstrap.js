'use strict';

//extend localForage with query capabilities
before(function(done) {
	// Force localStorage to be the backend driver.
	localforage.setDriver(localforage.LOCALSTORAGE);

	//pass localforage instance to be extended
	Query.extend(localforage);

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