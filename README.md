# BP
Blood Pressure Backend borrowed from Nick Lathen

### Getting Started

1. clone the respository.
2. run npm install (or yarn)
3. setup credentials
    1. create an Auth0[http://auth0.com] account (if you don't have one)
    2. put the appropriate credentials into config/config.js (NOTE: for the "token" field in config.js, you'll be able to define "token" in step 6)
    3. put the appropriate credentials into tools/curl-auth0
    4. create an user in your auth0 account and save the <username> and <password> for step 6
4. run a local postgres server with a database called 'underpressure'
    1. (OSX) brew install postgres
    2. brew services start postgresql (service)[https://launchschool.com/blog/how-to-install-postgresql-on-a-mac]
    3. createdb underpressure (NOTE: use "dropdb underpressure" to delete the database)
5. start the server: node server/app.js
6. curl the data endpoint:
    1. ./tools/curl-auth0 <username> <password> http://localhost:9999/api/getPressures
    2. get the ID TOKEN from the console output and add it to the config.js as the "token" value
    3. run npm test to test that everything is working and populate the database with a year of pressure data (takes about 30 seconds)
    4. rerun step 1 and see the data

once the UI is written, you'll be able to:

7. go to 127.0.0.1:9999 and sign up for a new account
8. login, enter and explore the data.
