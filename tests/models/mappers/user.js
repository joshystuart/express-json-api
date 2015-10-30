function UserSerializer() {

}

UserSerializer.prototype.serialize = function(model) {
    return {
        name: {
            first: model['first-name'],
            last: model['last-name']
        },
        credentials: {
            username: model.username
        }
    };
};

module.exports = new UserSerializer();
