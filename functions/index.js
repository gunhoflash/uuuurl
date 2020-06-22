const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const DB = require('./db');
const R = require('./util/response');
const auth = require('./util/auth');

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
	R.render(res, 'index');
});

app.route('/link')
	.get((req, res) => {
		DB.initDB(functions);
		DB.searchAllURL(res);
	})
	.post((req, res) => {
		DB.initDB(functions);
		DB.insertURL(res, req.body.url, req.body.resType);
	})
	.delete((req, res) => {
		let input_password = req.body.password;
		if (auth.is_admin(input_password)) {
			DB.initDB(functions);
			DB.deleteURL(res, req.body.path);
		} else {
			R.response(res, false, 'Incorrect password.');
		}
	});
	
app.get('/:c/:hash', (req, res) => {
	DB.initDB(functions);
	DB.searchURL(res, req.params.c, req.params.hash, req.params.no_redirect || false);
});

app.get('/admin', (req, res) => {
	R.render(res, 'admin');
});

app.post('/auth', (req, res) => {
	let input_password = req.body.password;
	if (auth.is_admin(input_password)) {
		R.render(res, 'index', { is_admin: true, password: input_password });
	} else {
		R.status(res, 401);
	}
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