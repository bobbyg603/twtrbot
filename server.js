//twtrbot
//@bobbyg603
//05.03.2014

//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

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
        //searchQuery=clientData;
    });
    //If the user wants to add a query facilitate that
    socket.on('add query', function(query){
        if(checkExists(query)===-1) {
            searchQuery.push(query);
            socket.emit('server data', query + " added successfully");
            socket.emit('server data', JSON.stringify(searchQuery));
        } else socket.emit('server data', query+" already exists!");
    });
    //If the user wants to remove a query facilitate that
    socket.on('remove query', function(query){
        var index = checkExists(query);
        if(index===-1) socket.emit('server data', query+" already exists!");
        else {
            searchQuery.splice(index,1);
            socket.emit('server data', query + " removed successfully");
            socket.emit('server data', JSON.stringify(searchQuery));
        }
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
//var searchQuery = ['electronic','circuit','computer','LED','light'];
var searchQuery = ["rocket","moon","crypto","space","tesla","nasa"];
//var searchQuery = [];

//Do the following every 2150000 ms (36 minutes == 40 times a day)
setInterval(function(){
        
        //Loop through the search terms
        searchFavoriteFollow(0);
            
//} ,40000);
//},2150000);
},1075000);

//Function that searches all data in searchQuery[], favorites the relevant tweet and follows the user
var searchFavoriteFollow = function(qc) {
    
    //Have we tried all the seach queries? Yes -> Do nothing, No -> Keep going.
    if(qc >= searchQuery.length) ;
    else {
        
        //Search for tweets containing a query of interest, get their screen_names' and ids'
        robot.twit.get('search/tweets', { q: searchQuery[qc], count: 1 }, function (err,data,response) { 
           
            if(data.statuses[0]===undefined) console.log("Error undefined! (Too many queries?)");
            else{
                //console.log(JSON.stringify(data.statuses[0].user));
                console.log("search: "+searchQuery[qc]);
                console.log("user: "  +JSON.stringify(data.statuses[0].user.screen_name));
                console.log("tweet: " +JSON.stringify(data.statuses[0].text));
                
                //Favorite all 12 tweets
                robot.twit.post('favorites/create', { id: data.statuses[0].id_str }, function(err, reply) {
                  if(err) return handleError(err);
                  console.log('\nFavorited: ' + data.statuses[0].id_str);
                  io.sockets.emit('server data', ">> Favorited Tweet " +data.statuses[0].text+" at "+timestring()+" on "+datestring()+"<br/>");
                });
                
                //Follow all 12 users
                robot.twit.post('friendships/create', { id: data.statuses[0].user.id }, function(err, reply) {
                  if(err) return handleError(err);
                  var name = reply.screen_name;
                  console.log('\nMingle: followed @' + name);
                  io.sockets.emit('server data', ">> Followed @" +data.statuses[0].user.screen_name+" at "+timestring()+" on "+datestring()+"<br/>");
                });  
            }
        });
        
        //Recursively loop through each searchQuery
        searchFavoriteFollow(qc+1);
    }
};

//Handles get/post errors
function handleError(err) {
  console.error('response status:', err.statusCode);
  console.error('data:', err.data);
}

//Get date string for today's date (e.g. '2014-01-01')
function datestring () {
  var d = new Date(Date.now() - 5*60*60*1000);  //est timezone
  return d.getUTCFullYear()   + '-'
     +  (d.getUTCMonth() + 1) + '-'
     +   d.getDate();
}

//Get time string for now (military time)
function timestring () {
    var current = new Date();
    var time = current.getHours() + ":" +current.getMinutes() + ":" +current.getSeconds();
    return time;
}

//Checks if query exists in searchQuery[], returns -1 if false
function checkExists(q){
    console.log(searchQuery.indexOf(q));
    return searchQuery.indexOf(q);
}