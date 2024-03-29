const admin = require('firebase-admin');
const R = require('./util/response');
const crypto = require('crypto');
const salt = require('./keys.json').salt;
const iterations = 1000;
const keylen = 32;

let DB = null;

/*

	Set and initialize DB.
	You should call it at first to use any other functions.

*/
exports.initDB = (functions) => {
	if (DB === null) {
		admin.initializeApp(functions.config().firebase);
		DB = admin.firestore();
	}
};

/*

	Find and return all shorten URLs.

*/
exports.searchAllURL = async (res) => {
	let docs = await exports.printAllURL();

	// make hash to full-url
	docs.forEach(doc => {
		doc.path = hash2path(doc.short);
		delete doc.short;
	});

	R.response(res, true, `${docs.length} found.`, docs);
	return docs;
};

/*

	Find specific URL with hash string.
	Redirect user to the URL or response.

*/
exports.searchURL = async (res, hash, no_redirect) => {

	// handle exception: invalid value
	if (R.isInvalid(res, hash)) return null;

	// find URL
	let docRef = DB.collection('link').doc(hash);
	let doc = await docRef.get();

	// if URL not found,
	if (!doc.exists) {
		console.log(`404 for ${hash}`);
		if (no_redirect) {
			R.response(res, false, 'Link not found');
		} else {
			R.status(res, 404);
		}
		return null;
	}

	// populate data
	let data = await doc.data();
	console.log(data);

	// count up
	let count = data.count || 0;
	docRef.update({ count: count + 1 });

	// redirect or response.
	if (no_redirect) {
		R.response(res, true, 'Link found.', data.url);
	} else {
		R.redirect(res, data.url);
	}

	return data.url;
};

/*

	Create a new shorten URL for given URL using hash.
	Save the hash to DB.

	If resType(response type) is 'web', redirect to result page.

*/
exports.insertURL = async (res, url, resType) => {
	if (R.isInvalid(res, url)) return;

	let hash, full_hash, len;
	full_hash = crypto.pbkdf2Sync(url, salt, iterations, keylen, 'sha512').toString('base64').replace('/', '_');
	console.log(`full_hash: ${full_hash}`);

	for (i = 1, len = full_hash.length; i < len; i++) {
		hash = full_hash.slice(0, i);
		let docRef = DB.collection('link').doc(hash);
		let doc = await docRef.get();

		if (doc.exists) {
			if (doc.data().url === url) {
				// same url exist
				break;
			}
		} else {
			// save
			console.log(`save "${url}" as "${hash}"`);
			await docRef.set({
				url: url,
				count: 0
			});
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

exports.deleteURL = async (res, path) => {
	if (R.isInvalid(res, path)) return;

	let docRef = DB.collection('link').doc(path2hash(path));
	let doc = await docRef.get();

	console.log(`delete hash: ${path2hash(path)}`);

	// link not found
	if (!doc.exists) {
		R.response(res, false, 'Link Not Found');
		return;
	}

	// delete link
	await docRef.delete();
	R.response(res, true, 'Link deleted.');
};

exports.printAllURL = async () => {
	let snapshot = await DB.collection('link').get();

	console.log(`Print all URL:`);
	let docs = snapshot.docs.map(doc => Object.assign(doc.data(), { short: doc.id }));
	docs.sort((a, b) => b.count - a.count);
	console.log(docs);
	console.log(`${docs.length} found`);

	return docs;
};

/*

	Generate full URL with hash.

*/
const hash2path = (hash) => {
	return `/u${hash}`;
};
const path2hash = (path) => {
	return path;
};