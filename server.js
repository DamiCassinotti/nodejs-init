var express = require('express'),
	paymentsRoutes = require('./api/routes/paymentsRoutes'),
	bodyParser = require('body-parser'),
	port = process.env.PORT || 5000,
	errorModel = require('./api/models/error'),
	config = require('./config.json');

client = require('mysql-promise')();
client.configure({
  host     : config.database.host,
	port		 : config.database.port,
  user     : config.database.user,
  password : config.database.pass,
  database : config.database.schema
});

bootstrapApp = () => {
	var app = express();

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());

	app.use('/payments', paymentsRoutes);

	app.use((err, req, res, next) => {
		switch (err.name) {
			case 'UnauthorizedError': {
				res.status(401).send(errorModel.newError(0, 'Unauthorized Access'));
        		break;
			}
			case 'UnexpectedError': {
				res.status(500).send(errorModel.newError(1, 'Unexpected Error'));
        		break;
			}
			case 'ParametersError': {
				res.status(400).send(errorModel.newError(2, 'Parametros erroneos'));
        		break;
			}
		}
	});

	return app;
};

const server = {
	start: (onStart) => {
		var app = bootstrapApp();
		app.listen(port, () => onStart(port));
	},
	bootstrapApp
}

module.exports = server;
