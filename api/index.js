var express = require('express');
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken');
var request = require('request');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post('/auth', function (req, res) {
	// Grab the social network token
	var network = req.body.network;
	var socialToken = req.body.socialToken;

	// Validate the social token with Facebook
	validateWithProvider(network, socialToken).then(function (profile) {
		// Return a server signed JWT
		res.send(createJwt(profile));
	}).catch(function (err) {
		res.send('Failed!' + err.message);
	});
});

app.get('/secure', function (req, res) {
	var jwtString = req.query.jwt;

	try {
		var profile = verifyJwt(jwtString);
		res.send('You are good people: ' + profile.id);
	} catch (err) {
		res.send('Hey, you are not supposed to be here');
	}
});

var providers = {
    facebook: {
        url: 'https://graph.facebook.com/me'
    }
};

function validateWithProvider(network, socialToken) {
	return new Promise(function (resolve, reject) {
		// Send a GET request to Facebook with the token as query string
		request({
				url: providers[network].url,
				qs: {access_token: socialToken}
			},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					resolve(JSON.parse(body));
				} else {
					reject(err);
				}
			}
		);
	});
}

function createJwt(profile) {
	return jwt.sign(profile, 'MY_PRIVATE_KEY', {
		expiresIn: '2d',
		issuer: 'MY_APP'
	});
}

function verifyJwt(jwtString) {
	return jwt.verify(jwtString, 'MY_PRIVATE_KEY', {
		issuer: 'MY_APP'
	});
}

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});