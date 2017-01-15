/*
 * Serverside code in Node.js written for SpotifyCompare. It uses Express.js for routing and 
 * makes calls to the Spotify API as and when required.
 * 
 * Name : Subhankar Panda
 * Github : subhankar-panda
 */

//declaring dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var firstName, secondName;
var SpotifyWebApi = require('spotify-web-api-node');

//Spotify API keys 
var spotifyApi = new SpotifyWebApi({
	clientId: '7cc704d432914b978835c02abe655284',
	clientSecret: '98f7ac76db3a4f1e901c327cced74dae',
	redirectUri: 'http://localhost:3000/'
})

//routes
var index = require('./routes/index');
var users = require('./routes/users');
var submitform = require('./routes/compare')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//uses these routes for any type of request to the pages
app.use('/', index);
app.use('/users', users);

//queries the API and sends the artist data as a JavaScript object
app.get('/submitform', function(req, res){
	var first_followers, second_followers, first_img, second_img, first_genres, second_genres, first_id,
      second_id, first_top_tracks = {}, second_top_tracks = {};
	spotifyApi.searchArtists(firstName, {'market':'US','limit':1}).then(function(data){
      var array = [];
    	first_followers = (data['body']['artists']['items'][0]['followers'].total).toString();
      first_img = data['body']['artists']['items'][0]['images'][0]['url'];
      first_id = data['body']['artists']['items'][0]['id'];

      //using JavaScript's toString() implementation to get a comma separated list of genres
      for(i = 0; i < 3; i++){
        if((data['body']['artists']['items'][0]['genres'][i]) !== undefined){
          array.push( " " + (data['body']['artists']['items'][0]['genres'][i])); 
        }
      }
      first_genres = array.toString();
  }, function(err) {
  		console.log('err');
  }).then(function(){
      spotifyApi.getArtistTopTracks(first_id, 'US').then(function(drop) {
        //console.log(drop);
        //console.log(drop['body']['tracks'][0]['name']);
        //console.log(drop['body']['tracks'][1]['name']);
        first_top_tracks = {};
        for(a = 0; a < 3; a++){
          if(drop['body']['tracks'][a]['name'] !== undefined){
            var temp = drop['body']['tracks'][a]['name'];
            first_top_tracks[temp] = drop['body']['tracks'][a]['href'];
          }   
        }
      }, function(err) {
        console.log('Something went wrong!', err);
      });
  }).then(function(){
      spotifyApi.searchArtists(secondName, {'market':'US','limit':1}).then(function(payload) {
      var array2 = [];
      second_followers = (payload['body']['artists']['items'][0]['followers'].total).toString();
      second_img = payload['body']['artists']['items'][0]['images'][0]['url'];
      second_id = payload['body']['artists']['items'][0]['id'];


      //using JavaScript's toString() implementation to get a comma separated list of genres
      for(j = 0; j < 3; j++){
        if((payload['body']['artists']['items'][0]['genres'][j]) !== undefined){
          array2.push(" " + payload['body']['artists']['items'][0]['genres'][j]);
        }
      }
      second_genres = array2.toString();
      //res.send(payload);
      //sending both artist's data as in json
      
    }, function(err) {
        console.error(err);
      }).then(function(){
      spotifyApi.getArtistTopTracks(second_id, 'US').then(function(drop2) {
        //console.log(drop);
        //console.log(drop['body']['tracks'][0]['name']);
        //console.log(drop['body']['tracks'][1]['name']);
        second_top_tracks = {};
        for(b = 0; b < 3; b++){
          if(drop2['body']['tracks'][b]['name'] !== undefined){
            var temp = drop2['body']['tracks'][b]['name'];
            second_top_tracks[temp] = drop2['body']['tracks'][b]['href'];
          }   
        }
        console.log(second_top_tracks);

        res.render('submitform', {'first_followers' : first_followers, 'second_followers' : second_followers, 
      'firstName' : firstName, 'secondName' : secondName, 'first_img': first_img, 'second_img': second_img, 
      'first_genres': first_genres, 'second_genres': second_genres, 'first_top_tracks' : first_top_tracks, 
      'second_top_tracks' : second_top_tracks
      });
      }, function(err) {
        console.log('Something went wrongerinos!', err);
      });
  })
    });
});

//called when the submit button is pressed, generates errors
//TODO: generate error when the query does not have a valid return
app.post('/compare', function(req, res){
	firstName = req.body.firstArtist;
	secondName = req.body.secondArtist;

	console.log(firstName);
	console.log(secondName);

  //serverside input validation
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
