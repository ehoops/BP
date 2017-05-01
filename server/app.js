'use strict'

const webpackConfig = require('../webpack.config.js');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const api = require('./middlewares/api.js');
const app = express();
const port = process.env.PORT || 9999;
const folderNameLength = __dirname.split('').reverse().indexOf('/');
const appDirectory = __dirname.slice(0, __dirname.length - folderNameLength - 1); //base app directory

app.use(compression());
app.use(express.static(appDirectory + '/client'));
app.use('/build', express.static(appDirectory + '/build'));
app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.urlencoded({type: 'application/x-www-form-urlencoded', extended: true}));

app.post('/api/submitPressure', api.submitPressure);
app.get('/api/getPressures', api.getPressures);

app.get('*', (request, response) => {
  response.sendFile(`${appDirectory}/client/index.html`);
});

app.listen(port, () => {
  console.log(`Web Server Listening on port ${port}`);
});
