'use strict'
const config  = require('../config/config.js');
const $       = require('jQuery');
const chartBP = require('./chartBP');
const cookies = require('./cookies');

function onLoginClick() {
  // Add input fields for username and password
  $('#header').append('<div id="username-password" class="username-password"></div>')
  $('#username-password').append(
    'Username: <input type="text" name="username" id="username"></input>');
  $('#username-password').append('Password: <input type="text" name="password" id="password"></input>');
  // Change login button to submit button
  $('.login').text('Submit');
  $('.login').off('click', onLoginClick);
  $('.login').on('click', onLoginSubmit);
}

function onLoginSubmit() {
  // Get username and password values and use them to get an access token
  let username = $('#username').val();
  let password = $('#password').val();
  // Remove input fields and change button back to login
  $('#username-password').remove();
  $('.login').text('Login');
  $('.login').on('click', onLoginClick);
  $('.login').off('click', onLoginSubmit);
  // If there was input, get an id token
  if (username === '' | password === '') {return;}
  getAuth0Token(username, password);
}

function gotToken(data) {
  cookies.setCookie('BP_id_token', data.id_token, 1);
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
  let token = cookies.getCookie('BP_id_token');
  if (!token) {return;}
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
  let token = cookies.getCookie('BP_id_token');
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
  fetchAndDraw();
});
