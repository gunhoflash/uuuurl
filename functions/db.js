const R = require('./util/response');
const crypto = require('crypto');
const salt = 'test';
const iterations = 1000;
const keylen = 24;

let DB = null;

exports.initDB = (db) => {
	DB = db;
};

exports.searchAllURL = async (res) => {
	let docs = await exports.printAllURL();

	R.response(res, true, `${docs.length} found.`, docs);
	return docs;
};

exports.searchURL = async (res, hashed, redirect = true) => {
	if (R.isInvalid(res, hashed)) return null;

	let doc = await DB.collection('link').doc(hashed).get();

	if (!doc.exists) {
		if (redirect) {
			R.status(res, 404);
		} else {
			R.response(res, false, 'Link not found');
		}
		return null;
	}

	let data = await doc.data();
	console.log(data);

	if (redirect) {
		res.redirect(302, data.url);
	} else {
		R.response(res, true, 'Link found.', data.url);
	}

	return data.url;
};

// TODO: check url validity
exports.insertURL = async (res, url) => {
	if (R.isInvalid(res, url)) return;

	let hashed = crypto.pbkdf2Sync(url, salt, iterations, keylen, 'sha512').toString('base64');
	let doc = await DB.collection('link').doc(hashed);

	await doc.set({ url: url });
	R.response(res, true, hashed);
};

exports.deleteURL = async (res, hashed) => {
	if (R.isInvalid(res, hashed)) return;

	let doc = await DB.collection('link').doc(hashed).get();

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
