const R = require('./util/response');
const crypto = require('crypto');
const salt = 'test';
const iterations = 1000;
const keylen = 24;

let DB = null;

/*

	Set and initialize DB.
	You should call it at first to use any other functions.

*/
exports.initDB = (db) => {
	DB = db;
};

/*

	Find and return all shorten URLs.

*/
exports.searchAllURL = async (res) => {
	let docs = await exports.printAllURL();

	R.response(res, true, `${docs.length} found.`, docs);
	return docs;
};

/*

	Find specific URL with hash string.
	Redirect user to the URL or response.

*/
exports.searchURL = async (res, hash, redirect = true) => {

	// handle exception: invalid value
	if (R.isInvalid(res, hash)) return null;

	// find URL
	let doc = await DB.collection('link').doc(hash).get();

	// if URL not found,
	if (!doc.exists) {
		if (redirect) {
			R.status(res, 404);
		} else {
			R.response(res, false, 'Link not found');
		}
		return null;
	}

	// populate data and redirect or response.
	let data = await doc.data();
	console.log(data);
	if (redirect) {
		res.redirect(302, data.url);
	} else {
		R.response(res, true, 'Link found.', data.url);
	}

	return data.url;
};

/*

	Create a new shorten URL for given URL using hash.
	Save the hash to DB.

*/
exports.insertURL = async (res, url) => {
	if (R.isInvalid(res, url)) return;

	
	let hash = crypto.pbkdf2Sync(url, salt, iterations, keylen, 'sha512').toString('base64');
	let doc = await DB.collection('link').doc(hash);

	await doc.set({ url: url });
	R.response(res, true, hash);
};

exports.deleteURL = async (res, hash) => {
	if (R.isInvalid(res, hash)) return;

	let doc = await DB.collection('link').doc(hash).get();

	if (!doc.exists) {
		R.response(res, false, 'Link Not Found');
		return;
	}

	await doc.delete();
	R.response(res, true, 'Link deleted.');
};

exports.printAllURL = async () => {
	let n = 0;
	let snapshot = await DB.collection('link').get();

	console.log(`Print all URL:`);
	snapshot.forEach(doc => {
		console.log(doc.id, '=>', doc.data());
		n++;
	});
	console.log(`${n} found`);

	return snapshot;
};
