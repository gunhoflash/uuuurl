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

// Add middleware to authenticate requests
// app.use(myMiddleware);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

// GET
app.get('/', (req, res) => {
	res.render('index');
});
app.get('/link', async (req, res) => {
	await DB.searchAllURL(res);
});
app.get('/h/:hashed', async (req, res) => {
	await DB.searchURL(res, req.params.hashed, true);
});
app.get('/t/:hashed', async (req, res) => {
	await DB.searchURL(res, req.params.hashed, false);
});

// POST
app.post('/link', async (req, res) => {
	await DB.insertURL(res, req.body.url);
});

// DELETE
app.delete('/link', async (req, res) => { 
	await DB.deleteURL(res, req.body.url);
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