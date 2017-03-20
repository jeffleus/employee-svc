'use strict';
var mysql = require('mysql');
var Employees = require('./Employees');
var SMS = require('./SMS');
const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };
	
  var connection = mysql.createConnection({
  host     : 'callsheet-mysql.cn6x6nhayn9c.us-west-2.rds.amazonaws.com',
  user     : 'callsheetadmin',
  password : 'Eraser$17',
  database : 'CallsheetSQL'
});

connection.connect();

connection.query('SELECT count(*) AS EmpCount FROM Employees', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].EmpCount);
});

connection.end();

SMS.sendText('YO, dis a text from Lambda!', '+13108771151').then(function(data) {
		console.log(data);
		callback(null, response);
	});	
};

module.exports.get = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };
    //check the event path params for an employee id to use during lookup
    var id = (event.pathParameters && event.pathParameters.eid) ? event.pathParameters.eid : null;
    
    Employees.get(id).then(function(result) {
        if (result.count == 0) response.statusCode = 404;
        response.body = JSON.stringify({
            message: 'Successful get command found: ' + result.count,
            employees: result.employees
        });
        callback(null, response);
    }).catch(function(err) {
        console.log('there was an error during the get call');
        console.error(err);
    }).finally(function() {
        console.info('completed the employee model get');
    });
};

module.exports.create = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };
    
    var json = event.body;
    var employee;
    
    Employees.create(json).then(function(emp) {
        console.log('employee created, sending sms alert to confirm');
        employee = emp
        var msg = 'VISION: successfully created a new employee - ' + emp.id;
        return SMS.sendText(msg, '+13108771151');
    }).then(function(result) {
        response.body = JSON.stringify({
            message: 'Successfully created a new employee: ' + employee.id,
            employee: employee
        });
        callback(null, response);
    }).catch(function(err) {
        console.log('there was an error creating and employee');
        console.error(err);
    }).finally(function() {
        console.info('completed the employee model create');
    });
};

module.exports.update = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Goodbye for Now! Your function executed successfully!',
      input: event,
    }),
  };
    var json = event.body;
    var id = (event.pathParameters && event.pathParameters.eid) ? event.pathParameters.eid : null;
	
  Employees.update(event.body).then(function(employee) {
      console.log('employee updated using the EMP utility module');
      callback(null, response);
  }).catch(function(err) {
      console.log('There was an error updating the employee record');
      console.error(err);
      callback(err);
  });
};

module.exports.delete = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Goodbye for Now! Your function executed successfully!',
      input: event,
    })
  };

  var id = (event.pathParameters && event.pathParameters.eid) ? event.pathParameters.eid : null;
  if (!id) {
      callback(null, {
          statusCode: 400,
          body: JSON.stringify({ message: 'Valid employee id was not passed to the delete method.' })
      })
  }
	
  Employees.delete(id).then(function(count) {
      console.log('(' + count + ') - employee successfully deleted');
      callback(null, response);
  }).catch(function(err) {
      console.log('There was an error deleting the employee record');
      console.error(err);
      callback(errpath);
  });
};