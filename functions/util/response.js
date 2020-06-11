/*

	Response user with data and message. (status 200)

*/
exports.response = (res, success, message, data = {}) => {
	console.log(`[RESPONSE] ${message}`);
	if (res) {
		res.json({
			result: success ? 1 : -1,
			message: message ? message : (success ? 'success' : 'fail'),
			data: data
		});
	}
};

/*

	Redirect user. (status 302)

*/
exports.redirect = (res, url) => {
	console.log(`[REDIRECT] ${url}`);
	if (res) {
		res.redirect(302, url);
	}
};

/*

	Render page. (status 200)

*/
exports.render = (res, page, data = {}) => {
	console.log(`[RENDER] '${page}' with data:\n${JSON.stringify(data, null, 2)}`);
	if (res) {
		res
		.set('Content-Type', 'text/html')
		.render(page, data);
	}
};

/*

	If some of values in args are falsy,
	response to user.

	This function is used to check
	validity of query data.

*/
exports.isInvalid = (res, ...args) => {
	let b = args.some(v => (v === null || v === undefined || v.length === 0));
	if (b) exports.response(res, false, 'incomplete query');
	return b;
};

/*

	Set the HTTP status for the response.
	Send specific error message.

*/
exports.status = (res, code) => {
	let message = '';
	switch (code) {
		case 404: message = '404 not found';             break;
		case 500: message = '500 internal server error'; break;
		default:                                         break;
	}
	console.log(`[STATUS ${code}] ${message}`);
	if (res) {
		res.status(code).render('error', {
			code: code,
			message: message
		});
	}
};