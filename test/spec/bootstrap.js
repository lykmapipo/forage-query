'use strict';

//extend localForage with query capabilities
before(function(done) {
    //pass localforage instance to be extended
    Query.extend(window.localforage);
    done();
});