var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var firstName, secondName;
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
	clientId: '7cc704d432914b978835c02abe655284',
	clientSecret: '98f7ac76db3a4f1e901c327cced74dae',
	redirectUri: 'http://localhost:3000/'
})

var index = require('./routes/index');
var users = require('./routes/users');
var submitform = require('./routes/compare')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
//app.use('/compare' compare)
app.get('/submitform', function(req, res){
	var first_followers, second_followers, first_img, second_img;
	spotifyApi.searchArtists(firstName, {'market':'US','limit':1}).then(function(data) {
    	first_followers = (data['body']['artists']['items'][0]['followers'].total).toString();
      first_img = data['body']['artists']['items'][0]['images'][0]['url'];
    	console.log(data);
  }, function(err) {
  		console.log('err');
  }).then(function(){
      spotifyApi.searchArtists(secondName, {'market':'US','limit':1}).then(function(payload) {
      //var first_followers = data['body']['artists']['items'][0]['followers'].total;
      second_followers = (payload['body']['artists']['items'][0]['followers'].total).toString();
      second_img = payload['body']['artists']['items'][0]['images'][0]['url'];
      res.render('submitform', {'first_followers' : first_followers, 'second_followers' : second_followers, 
        'firstName' : firstName, 'secondName' : secondName, 'first_img': first_img, 'second_img': second_img});
      }, function(err) {
        console.error(err);
      });
    });
});

app.post('/compare', function(req, res){
	firstName = req.body.firstArtist;
	secondName = req.body.secondArtist;

	console.log(firstName);
	console.log(secondName);

	if(firstName === '' || secondName === ''){
		res.render('compare', {firstName: firstName, secondName: secondName});
	}
	else{
		res.redirect('/submitform');
	}
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
