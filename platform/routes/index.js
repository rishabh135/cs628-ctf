var express = require('express');
var basicAuth = require('basic-auth');
var router = express.Router();
var config = require('../config.js');
/* GET home page. */
router.get('/', function(req, res, next) {
  var isDone = [0,0,0,0,0,0,0,0,0,0];
  flagModel = res.app.locals.flagModel;
  user = basicAuth(req);
  flagModel.findOne({
    attributes: ['answers'],
    where: {
      username: user.name
    }
  }).then(function(data) {
    if(data != null) {
      isDone = data.answers;
    }
    res.render('index', { title: 'CS628 CTF', isdone: isDone });
  });
});


router.get('/correct', function(req, res, next) {
  res.render('correct', {});
});

router.get('/incorrect', function(req, res, next) {
  res.render('incorrect', {});
});

router.post('/submit', function(req, res, next) {
  var fs = require('fs');
  var isDone = [0,0,0,0,0,0,0,0,0,0];
  var flagModel = res.app.locals.flagModel;
  var user = basicAuth(req);
  var question = parseInt(req.body.question);
  var flag = req.body.flag;
  // check for valid question number
  if(isNaN(question) || question < 0 || question > 9 ) {
    res.sendStatus(500);
  }
  else {
    var correct = check_flag(user.name, question, flag);
    var logString = user.name + ' ' + (new Date()).toString() + ' ' + ' ' + question + ' ' + flag + ' ' + correct + '\n';
    fs.appendFile('platform.log', logString, function(err) {
          if (err) throw err;
        }
    );
    if (correct) {
      // find all his answers
      flagModel.findOne({
        attributes: ['answers'],
        where: {
          username: user.name
        }
      }).then(function (data) {
        if(data != null) {
          isDone = data.answers;
        }
        isDone[question-1] = 1;

        //upsert the db
        flagModel.upsert({
          username: user.name,
          answers: isDone
        }).then(function() {
          res.redirect('/correct');
        });
      });
    }
    else {
      res.redirect('/incorrect');
    }
  }
});


function check_flag(username, question, flag) {
  if (question == 2) question = 3;
  else if (question == 3) question = 2;
  if(question == 9)
      return flag == 'oCap7ainMyCapta1n';
  else if (question == 7)
      return flag == 'Weak_password_means_no_password';
  else if(question == 10)
      return flag == 'toBeOrN0t7oBe';
  var crypto = require('crypto');
  var secret = config.secret;
  var hash = crypto.createHash('md5').update(secret+question+username).digest('hex');
  return hash == flag;
}

module.exports = router;
