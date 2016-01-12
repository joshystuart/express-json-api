function UserSerializer() {

}

UserSerializer.prototype.serialize = function(model) {
    return {
        id: model._id,
        name: {
            first: model['first-name'],
            last: model['last-name']
        },
        address: model.address,
        credentials: {
            username: model.username
        }
    };
};

module.exports = new UserSerializer();
