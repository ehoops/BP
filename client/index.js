'use strict'
const config   = require('../config/config.js');
const $        = require('jQuery');
const chartBP = require('./chartBP');

let token;

function onLoginClick() {
  console.log('login clicked');
  // Add input fields for username and password
  $('#header').append('<div id="username-password"></div>')
  $('#username-password').append('Username: <input type="text" name="username" id="username"></input>');
  $('#username-password').append('Password: <input type="text" name="password" id="password"></input>');
  // Change login button to submit button
  $('.login').text('Submit');
  $('.login').off('click', onLoginClick);
  $('.login').on('click', onLoginSubmit);
}

function onLoginSubmit() {
  console.log('submit login clicked');
  // Get username and password values and use them to get an access token
  let username = $('#username').val();
  let password = $('#password').val();
  getAuth0Token(username, password);

  // Remove input fields and change button back to login
  $('#username-password').remove();
  $('.login').text('Login');
  $('.login').on('click', onLoginClick);
  $('.login').off('click', onLoginSubmit);

}

function gotToken(data) {
  token = data.id_token;
  fetchAndDraw();
}

function getAuth0Token(username, password) {
  $.ajax({
    type: 'POST',
    url: 'https://ehoops.auth0.com/oauth/ro',
    data: {
      client_id: config.AUTH0_CLIENT_ID,
      username: username,
      password: password,
      connection: 'Username-Password-Authentication',
      grant_type: 'password',
      scope: 'openid email',
    },
    success: gotToken,
    error: console.log,
  })
}

function fetchAndDraw() {
  $.ajax({
    type: 'GET',
    url: '/api/getPressures',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    },
    success: chartBP,
    error: console.log,
  });
}

function onSubmitPressure() {
  let newSystolic = parseInt($('#newSystolic').val());
  let newDiastolic = parseInt($('#newDiastolic').val());
  $('#newSystolic').val('');
  $('#newDiastolic').val('');
  $.ajax({
    type: 'POST',
    url: '/api/submitPressure',
    data: {
      systolic: newSystolic,
      diastolic: newDiastolic
    },
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    },
    success: fetchAndDraw,
    error: console.log,
  });

}

$(document).ready(function(){
  $('.submitPressure').on('click', onSubmitPressure);
  $('.login').on('click', onLoginClick);
  token = getAuth0Token();

});
