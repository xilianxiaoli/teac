var UserService = require('./UserService.js');

var model = {
	instance: undefined
};

module.exports = {

	init: function(obj) {
		model.instance = obj;

		return {
			UserService: UserService.init(model.instance)
		}
	}

};
