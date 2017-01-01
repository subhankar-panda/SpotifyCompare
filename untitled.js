spotifyApi.searchArtists(firstName, {'market':'US','limit':1}).then(function(data) {
    	//var first_followers = data['body']['artists']['items'][0]['followers'].total;
    	first_followers = (data['body']['artists']['items'][0]['followers'].total).toString();
  	},
  	spotifyApi.searchArtists(secondName, {'market':'US','limit':1}).then(function(payload) {
    	//var first_followers = data['body']['artists']['items'][0]['followers'].total;
    	second_followers = (payload['body']['artists']['items'][0]['followers'].total).toString();
    	res.render('submitform', {'first_followers' : first_followers, 'second_followers' : second_followers, 
    		'firstName' : firstName, 'secondName' : secondName});
  	}, function(err) {
    	console.error(err);
  	}));