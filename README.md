# Express JSON API

This is an easy to use Express.js route helper that adapts your Mongoose models to jsonapi.org API endpoints.

## Install

```
npm install express-json-api
```

## Usage

```
var express = require('express');
var expressJsonApi = require('express-json-api');
var getList = expressJsonApi.controllers.get-list;

var routes = {
    routes: [
        {
            endpoint: '/users',
            model: {
                schema: user // mongoose Schema
            },
            limit: 20,
            id: '_id',
            methods: {
                getList: getList.default
            }
        }
    ]
};

expressJsonApi.init(app, routes);
```
