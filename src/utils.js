module.exports = {
	validate: {
		isEmpty: function(value) {
			return !value || !value.length;
		},
		certidValidata: function(value) {
			if (!/(^\d{15}$)|(^\d{17}(\d|X)$)/.test(value)) {
				return false;
			} else {
				var strJiaoYan = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'),
					intQuan = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1),
					intTemp = 0,
					i;

				for (i = 0; i < value.length - 1; i++) {
					intTemp += value.substring(i, i + 1) * intQuan[i];
				}

				intTemp %= 11;
				return value.substring(value.length - 1) === strJiaoYan[intTemp];
			}
		},
		bankCard: function(value) {
			return /^[0-9]{10,19}$/.test(value);
		},
		phoneNumber: function(value) {
			return /^(13|15|18|17|14)[0-9]{9}$/.test(value);
		},
		checkPwd: function(value) {
			return /^(?![^a-zA-Z]+$)(?!\D+$).{6,20}$/.test(value);
		},
		comparePwd: function(one, two) {
			return one === two;
		}
	}

}
