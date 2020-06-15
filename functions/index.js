const admin = require('firebase-admin');
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const DB = require('./db');
const R = require('./util/response');

/*

	Firestore

*/
admin.initializeApp(functions.config().firebase);
DB.initDB(admin.firestore());

/*

	Express

*/
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// set view engine and static directories
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

// GET
app.get('/', (req, res) => {
	res.render('index');
});

app.route('/link')
	.get(async (req, res) => {
		await DB.searchAllURL(req, res);
	})
	.post(async (req, res) => {
		await DB.insertURL(req, res, req.body.url, req.body.resType);
	})
	.delete(async (req, res) => { 
		await DB.deleteURL(res, req.body.url);
	});

app.get('/:c/:hash', async (req, res) => {
	await DB.searchURL(res, req.params.c, req.params.hash, req.params.no_redirect || false);
});

// handle 404
app.use((req, res, next) => {
	R.status(res, 404);
});

// handle 500
app.use((err, req, res, next) => {
	console.log(`[ERROR] ${err.stack || err}`);
	R.status(res, 500);
});

exports.app = functions.https.onRequest(app);