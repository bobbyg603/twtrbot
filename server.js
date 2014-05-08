//twtrbot
//@bobbyg603
//05.03.2014

//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

//Include 3rd party packages
var ejs = require('ejs');
var twit = require('twit');

//Build the web server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//Render the views with ejs (similar to html)
app.set('view engine', 'ejs');

//Define the landing page
app.get('/', function(req,res) {
    //res.render('index', { title: 'The index page!' });
    res.render('index');
});

//Create a web server that will run our app
server.listen(process.env.PORT);

//Start the socket
io.sockets.on('connection', function (socket) {
  socket.on('client data', function (clientData) {
    console.log(clientData);
    searchQuery=clientData;
  });
  socket.emit('server data', JSON.stringify(searchQuery));
});  

//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

//Start the robot
var bot = require('./lib/bot');
var config = require('./config/config');
var robot = new bot(config);

//Define what we are looking for
//var searchQuery = ['weed' , 'marijuana' , 'pot -crock -pan' , 'hash -tag' , 'dab' , 'dabs' , 'bong' , 'ganja', 'blaze' , 'kush', 'legalize' , '420'];
var searchQuery = ['electronic','circuit','computer','LED','light'];

//Function that searches all data in searchQuery[], favorites the relevant tweet and follows the user
var searchFavoriteFollow = function(qc) {
    //Have we tried all the seach queries? Yes -> Do nothing, No -> Keep going.
    if(qc >= searchQuery.length) ;
    else {
        
        //Search for tweets containing a query of interest, get their screen_names' and ids'
        robot.twit.get('search/tweets', { q: searchQuery[qc], count: 1 }, function (err,data,response) { 
            
            //console.log(JSON.stringify(data.statuses[0].user));
            console.log("search: "+searchQuery[qc]);
            console.log("user: "  +JSON.stringify(data.statuses[0].user.screen_name));
            console.log("tweet: " +JSON.stringify(data.statuses[0].text));
            
            //Favorite all 12 tweets
            robot.twit.post('favorites/create', { id: data.statuses[0].id_str }, function(err, reply) {
              if(err) return handleError(err);
              console.log('\nFavorited: ' + data.statuses[0].id_str);
            });
            
            //Follow all 12 users
            robot.twit.post('friendships/create', { id: data.statuses[0].user.id }, function(err, reply) {
              if(err) return handleError(err);
              var name = reply.screen_name;
              console.log('\nMingle: followed @' + name);
            });
        });
        
        //Recursively loop through each searchQuery
        searchFavoriteFollow(qc+1);
    }
};
    
//Do the following every 2150000 ms (36 minutes == 40 times a day)
setInterval(function(){
        
    //Loop through the search terms
    searchFavoriteFollow(0);
        
//} ,10000);
},2160000);

function handleError(err) {
  console.error('response status:', err.statusCode);
  console.error('data:', err.data);
}
