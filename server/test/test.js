const expect = require('chai').expect;
const config = require('../../config/config.js');
const token = config.token;
const controllers = require('../../db/controllers.js');
const models = require('../../db/models.js');
const userModel = models.userModel;
const userController = controllers.userController;
const api = require('../middlewares/api.js');
const mock = require('./mock.js');

const user1 = 'Alice';
const user2 = 'Bob';
const pressure1 = {date: 1, systolic: 140, diastolic: 80};
const pressure2 = {date: 2, systolic: 130, diastolic: 85};

describe('Database', () => {
  it('should sync the models without error', done => {
    controllers.sync({force: true})
    .then(() => done());
  });
  describe('userController', () => {
    it('should add users', done => {
      Promise.all([
        userController.createUser(user1),
        userController.createUser(user2),
      ])
      .then((users) => {
        expect(users[0].username).to.equal(user1);
        expect(users[1].username).to.equal(user2);
        done();
      });
    });
    it('should get users', done => {
      Promise.all([
        userController.getUser('Alice'),
        userController.getUser('Bob'),
      ])
      .then( users => {
        expect(users[0].username).to.equal(user1);
        expect(users[1].username).to.equal(user2);
        done();
      });
    });
    it('should add pressures', done => {
      Promise.all([
        userController.addPressure(user1, pressure1),
        userController.addPressure(user1, pressure2),
      ])
      .then((pressures) => {
        expect(+pressures[0].date).to.equal(pressure1.date);
        expect(+pressures[1].date).to.equal(pressure2.date);
        done();
      })
      .catch(done);
    });
    it('should get pressures', done => {
      userController.getPressures(user1)
      .then((pressures) => {
        expect(pressures.length).to.equal(2);
        expect(+pressures[1].date > +pressures[0].date).to.be.true;
        done();
      })
      .catch(done);
    });
  });
});

describe('api middleware', () => {
  var numPressures = 0;
  it('should submit pressures', done => {
    const submitPromiseFunctions = [];
    const pressures = mock.generatePressures();
    pressures.forEach(pressure => {
      const submitPressurePromise = function() {
        return new Promise((resolve, reject) => {
          console.log(pressure.date);
          const requestMock = {
            headers: {
              Authorization: `Bearer ${config.token}`
            },
            body: {
              systolic: pressure.systolic,
              diastolic: pressure.diastolic,
              date: pressure.date
            }
          };
          const responseMock = {
            status() {
            },
            send(apiResponse) {
              resolve(apiResponse);
            }
          };
          api.submitPressure(requestMock, responseMock);
        });
      };
      submitPromiseFunctions.push(submitPressurePromise);
    });
    numPressures = submitPromiseFunctions.length;
    mock.promiseAllSync(submitPromiseFunctions)
    .then(submitResponses => {
      expect(submitResponses.length).to.equal(numPressures);
      done();
    });
  }).timeout(0);
  it('should retrieve pressures', done => {
    const requestMock = {
      headers: {
        Authorization: `Bearer ${config.token}`
      }
    };
    const responseMock = {
      status() {
      },
      send(pressures) {
        expect(pressures.length).to.equal(numPressures);
        done();
      }
    };
    api.getPressures(requestMock, responseMock);
  });
});