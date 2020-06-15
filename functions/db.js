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
exports.searchAllURL = async (req, res) => {
	let docs = await exports.printAllURL();

	// make hash to full-url
	docs.forEach(doc => {
		doc.short = hash2path(doc.short);
	});

	R.response(res, true, `${docs.length} found.`, docs);
	return docs;
};

/*

	Find specific URL with hash string.
	Redirect user to the URL or response.

*/
exports.searchURL = async (res, c, hash, redirect = true) => {

	// handle exception: invalid value
	if (R.isInvalid(res, c, hash)) return null;

	// find URL
	hash = c + hash;
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
		R.redirect(res, data.url);
	} else {
		R.response(res, true, 'Link found.', data.url);
	}

	return data.url;
};

/*

	Create a new shorten URL for given URL using hash.
	Save the hash to DB.

	If resType(response type) is 'web', redirect to result page.

*/
exports.insertURL = async (req, res, url, resType) => {
	if (R.isInvalid(res, url)) return;

	let hash, full_hash, len;
	full_hash = crypto.pbkdf2Sync(url, salt, iterations, keylen, 'sha512').toString('base64');

	for (i = 2, len = full_hash.length; i < len; i++) {
		hash = full_hash.slice(0, i);
		let doc = await DB.collection('link').doc(hash);
		let get = await doc.get();

		if (get.exists) {
			if (get.data().url == url) {
				// same url exist
				break;
			}
		} else {
			// save
			console.log(`save "${url}" as "${hash}"`);
			await doc.set({ url: url });
			break;
		}
	}

	if (i >= len) {
		// not saved
		if (resType === 'web') {
			R.render(res, 'result', {
				result: 1 // need another hash to save the URL
			});
		} else {
			R.response(res, false, 'Need another hash to save the URL.');
		}
	} else {
		// saved
		let s = hash2path(hash);
		if (resType === 'web') {
			R.render(res, 'result', {
				result: 0, // success
				path: s
			});
		} else {
			R.response(res, true, s);
		}
	}
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
	let snapshot = await DB.collection('link').get();

	console.log(`Print all URL:`);
	let docs = snapshot.docs.map(doc => Object.assign(doc.data(), { short: doc.id }));
	console.log(docs);
	console.log(`${docs.length} found`);

	return docs;
};

/*

	Generate full URL with hash.

*/
const hash2path = (hash) => {
	return `/${hash[0]}/${hash.slice(1)}`;
};