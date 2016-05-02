var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('Hello World!');
});

/*
This is a web server that can listen to requests for /hello, 
and respond with some HTML that says <h1>Hello World!</h1>
*/
app.get('/hello', function(req, res) {
  res.send('<h1>Hello World!</h1>');
});


/* This is a web server that can listen to requests for /hello/name, 
and respond with some HTML that says <h1>Hello _name_!</h1>. 
*/
app.get('/hello/:name', function(req, res) {
  res.send('<h1>Hello ' + req.params.name + '!<h1>');
});

/*This is a web server that can listen to requests for /calculator/:operation?num1=XX&num2=XX 
and respond with a JSON object that looks like the following. For example, /op/add?num1=31&num2=11:

{
  "operator": "add",
  "firstOperand": 31,
  "secondOperand": 11,
  "solution": 42
}
*/

function add(num1, num2) {
  return num1 + num2;
}

function sub(num1, num2) {
  return num1 - num2;
}

function mult(num1, num2) {
  return num1 * num2;
}

function div(num1, num2) {
  return num1 / num2;
}

app.get('/calculator/:operation/:num1/:num2', function(req, res) {
  var op = req.params.operation;
  var leresult;
  switch (op) {
    case 'add':
      leresult = add(Number(req.params.num1), Number(req.params.num2));
      break;
    case 'sub':
      leresult = sub(Number(req.params.num1), Number(req.params.num2));
      break;
    case 'mult':
      leresult = mult(Number(req.params.num1), Number(req.params.num2));
      break;
    case 'div':
      leresult = div(Number(req.params.num1), Number(req.params.num2));
      break;
    default:
      leresult = "error";
  }
  if ((leresult === 'error') || (isNaN(Number(req.params.num1)) || isNaN(Number(req.params.num2)))) {
    res.send('This is not a valid operation or number');
  }
  else {
    var finalResult = {
      operator: req.params.operation,
      firstOperand: req.params.num1,
      secondOperand: req.params.num2,
      solution: leresult
    };
    res.send(finalResult);
  }
});



/*
This is a web server that can retrieve data from my database
*/
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'reddit'
});


function getTheFiveLastPosts(callback) {
  connection.query(`SELECT p.id AS post_id, p.title AS post_title, p.url AS post_url, p.userId AS post_userId, p.createdAt AS post_createdAt, p.updatedAt AS post_updated, p.subredditId AS post_subredditId,
              u.id AS users_id, u.username AS users_username
    FROM posts p
    JOIN users u ON p.userId=u.id
    ORDER BY p.createdAt DESC
    LIMIT 5`,
    function(err, results) {
      if (err) {
        callback(err);
      }
      else {
        var resultsFormated = results.map(function(res) {
          return {
            postId: res.post_id,
            title: res.post_title,
            url: res.post_url,
            createdAt: res.post_createdAt,
            updatedAt: res.post_updated,
            postUserId: res.post_userId,
            userId: res.users_id,
            username: res.users_username
          };
        });
        callback(null, resultsFormated);
      }
    }
  );
}

app.get('/posts', function(request, response) {
  getTheFiveLastPosts(function(err, posts) {
    if (err) {
      console.log(err);
      response.status(500).send('oops try again later!');
    }
    else {
      var niceArray = posts.map(function(post) {
        return `<li class="content-item">
        <h2 class="content-item__title">
        <a href=${post.url}>${post.title}</a>
        </h2>
        <p>Created by ${post.username}</p>
        </li>`
      });
      response.send(`<div id="contents">
        <h1>List of contents</h1>
        <ul class="contents-list">
          ${niceArray.join('')}
        </ul>
        </div>`);
    }
  });
});

/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
