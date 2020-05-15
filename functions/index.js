const express = require('express');
const cors = require('cors');

/*

	Express

*/
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to authenticate requests
// app.use(myMiddleware);

// build multiple CRUD interfaces:
app.get('/', (req, res) => {
	res.send("Hello! This is uuuurl.");
});
app.get('/:to', (req, res) => {
	// TODO: use DB
	res.send(`hi ${req.params.to}`);
});

// Expose Express API as a single Cloud Function:
// exports.widgets = functions.https.onRequest(app);

exports.app = functions.https.onRequest(app);
