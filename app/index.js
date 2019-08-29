var express = require('express');
const routes = require('./routes/routes');
const path = require('path');

// Run express
var app = express();

// Use the routes defined in routes/routes.js
app.use(routes);

// Routes
/**
 * Returns a simple message  
 */ 
app.get('/', function(request,response){
    response.sendFile(path.join(__dirname, 'views/index.html'));
});

// Listen to port: 3000
app.listen(3000);