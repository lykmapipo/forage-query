'use strict';

//forage query nodejs sample

var forageQuery = require('../dist/forageQuery'); //require('forage-query');
var localforage = require('localforage');
forageQuery.extend(localforage);

console.log(localforage.findById);