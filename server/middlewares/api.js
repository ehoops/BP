const controllers = require('../../db/controllers.js');
const userController = controllers.userController;
const bareRequest = require('request');
const config = require('../../config/config.js');
const AUTH0_DOMAIN = config.AUTH0_DOMAIN;

// NOTE: for demo purposes only: there are better ways to do this
const getToken = function getToken(request) {
  //console.log(request);
  let headers = request.headers || {}
  const header = headers.Authorization || headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.substring(7)
  }
  throw new Error("invalid Authorization header")
}

const request = function request(options) {
  return new Promise(function(resolve, reject) {
    bareRequest(options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

const getUsername = function getUsername(token) {
  return request({
    url: `https://${AUTH0_DOMAIN}/tokeninfo?id_token=${token}`
  })
  .then((response) => {
    const body = response.body;
    if (body !== 'Unauthorized') {
      username = JSON.parse(body).email;
      return username;
    } else {
      throw Error('no user found with that token.');
    }
  });
};

module.exports = {
  submitPressure(request, response) {
    console.log('request made');
    const token = getToken(request)
    const body = request.body;
    console.log(request);
    const diastolic = body.diastolic;
    const systolic = body.systolic;
    const date = body.date ? body.date : Date.now();
    return getUsername(token)
    .then(username => {
      return userController.addPressure(username, {date, systolic, diastolic})
      .then(pressure => {
        response.status(200);
        response.send(['success']);
        return;
      })
      .catch(error => {
        console.error(error);
        response.status(500);
        response.send(['internal error']);
      });
    });
  },
  getPressures(request, response) {
    const token = getToken(request)
    getUsername(token)
    .then(username => {
      return userController.getPressures(username)
      .then(pressures => {
        response.status(200);
        response.send(pressures);
      });
    })
    .catch(error => {
      console.error(error);
      response.status(500);
      response.send(['internal error']);
    });
  }
};
