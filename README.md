forageQuery
===========
[![Build Status](https://travis-ci.org/lykmapipo/forageQuery.svg?branch=master)](https://travis-ci.org/lykmapipo/forageQuery)

Query builder for [localForage](https://github.com/mozilla/localForage) using [JavaScript implementation of MongoDB query language](https://github.com/kofrasa/mingo)

## Guide

* [Install](#install)
* [Usage](#usage)
* [Testing](#testing)
* [Development](#development)
* [Contribute](#contribute)

## Install
```sh
$ bower install --save forageQuery
```
## Usage
- Include `forageQuery` into your app index.html 
```html
<!doctype html>
<html>
<head>
    ...
</head>
<body>
    
    ...

    <!-- build:js(.) scripts/vendor.js -->
    <!-- bower:js -->
    <script src="bower_components/forageQuery/dist/forageQuery.js"></script>
    <!-- endbower -->
    <!-- endbuild -->

    <!-- build:js({.tmp,app}) scripts/yourApp.js -->
    <script src="scripts/app.js"></script>
    <!-- endbuild -->

    ...

</body>
</html>
```

## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install --dev && bower install
```

* Then run test
```sh
$ npm test
```

## Development
`forageQuery` has set of useful `grunt` tasks to help you with development. By running
```sh
$ grunt
```
`forageQuery` will be able watch your development environment for file changes and apply `jshint` and `karma` to the project.

## Contribute
Fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## References
- [localforage](https://github.com/mozilla/localForage)
- [filtr](https://github.com/logicalparadox/filtr/)
- [mongomock](https://github.com/AndrewGrachov/mongomock)
- [mongo-query](https://github.com/AndrewGrachov/mongo-query)
- [mongo-query](https://github.com/Automattic/mongo-query)
- [mongo-json-query](https://github.com/mcvella/mongo-json-query)
- [json-query](https://github.com/eugeneware/jsonquery)
- [mingo](https://github.com/kofrasa/mingo)

## Licence

Copyright (c) 2015 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.