
module.exports = {

	init: function(obj, bu) {
		var _this = obj;

		return {
			login: function(email, password) {
				return _this.$http.get('/user/login/' + email + '/' + password);
			}
		}

	}

};
