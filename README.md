# Express JSON API

[![Build Status](https://travis-ci.org/crimsonronin/express-json-api.svg)](https://travis-ci.org/crimsonronin/express-json-api)

This is an easy to use Express.js route helper that adapts your Mongoose models to [jsonapi.org](http://jsonapi.org) API endpoints. Basically it allows you to do CRUD on your mongoose models with some simple configuration.

Note; this is still very much a work in progress, but I would love to hear your thoughts.

## Install

```
npm install express-json-api --save
```

## Requirements

You are also required to be running [expressjs](http://expressjs.com/en/index.html) and [mongoose](http://mongoosejs.com).

```
npm install express --save
npm install mongoose --save
```

## Quick Start

```
var express = require('express');
var expressJsonApi = require('express-json-api');
var get = expressJsonApi.controllers.get;
var getList = expressJsonApi.controllers.getList;
var patch = expressJsonApi.controllers.patch;
var userModel = require('../models/user'); // a reference to your mongoose models

var config = {
    routes: [
        {
            endpoint: '/users',
            model: userModel,
            limit: 20,
            id: '_id',
            methods: {
                get: get.default,
                getList: getList.default,
                patch: patch.default
            },
            search: {
                active: true,
                fields: ['first-name']
            },
            sanitize: {
                active: true
            }
        }
    ]
};

expressJsonApi.init(app, config);
```

Now you can access your users by:

* `GET /users` to get all users
* `GET /users/:id` to get a single user
* `PATCH /users/:id` to update a single user

## Filters, Sort, Pagination and Search

There are a number of modifers to help return the correct data. These all follow the recommendations of [jsonapi.org](http://jsonapi.org)

* `GET /users?filter[first-name]=Elon&filter[last-name]=Musk` to get all users with the first name "Elon" and the last name "Musk".
* `GET /users?sort=last-name` to get all users and sort by descending last name.
* `GET /users?q=Elon` to get all users with "Elon" in the `first-name` field.
* `GET /users?page[limit]=1&page[offset]=3` to get 1 user starting at the 4th.

You can, of course, combine all those together into one long query:

`GET /users?filter[country]=Australia&sort=-last-name,first-name&page[limit]=10` to get all Australian users, sort by descending last name, then ascending first name and limit the response to 10 items per page.

## TODO

* Write more thorough documentation on sanitizers, how to override individual implementations, and how to use custom serializers.
* Create `POST` functionality (I just didn't have the need in the application I was writing this module for).
* Create `DELETE` functionality.
* Implement: 
    * Stronger jsonapi response standards (eg. `{ data: { type: "users" } }`). See [http://jsonapi.org/format/#document-resource-objects](http://jsonapi.org/format/#document-resource-objects)
    * jsonapi `relationships` and `links`.
    * Standardised error message.
    * Dev/debugging mode so that stack traces aren't displayed in production systems.