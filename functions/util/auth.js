const keys = require('../keys.json');

// return whether the password is correct or not
exports.is_admin = (password) => {
    if (typeof password !== 'string') return false;
	return (password === keys.admin_password);
};