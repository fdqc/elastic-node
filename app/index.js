var express = require('express');
const { Client } = require('@elastic/elasticsearch');
const path = require('path');


// Run express
var app = express();
// Define the elasticSearch client
const client = new Client({ node: 'http://localhost:9200' });

// Routes
/**
 * Returns a simple message  
 */ 
app.get('/', function(request,response){
    response.sendFile(path.join(__dirname, 'views/index.html'));
});

/**
 * Returns a list of locations
 * the default size is 10
 * 
 * @returns json[]
 */
app.get('/locations', async function(request,response){
    let defaultSize = 10;

    // search for all the locations in the index
    const { body } = await client.search({
        index: 'logstash-2019.08.24-000001',
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
            query: {
                match_all: {}
            },
            _source: ["id","type","message","loc_postal_code","loc_name","province_name"],
            size: defaultSize
        }
    });

    response.send(body.hits.hits);
});

/**
 * Searches for a location that matches the
 * provided term
 * @param term string
 * @returns json[]
 */
app.get('/locations-autocomplete', async function(request,response){
    let defaultSize = 10;

    // search for location name's that matches
    // the request term
    const { body } = await client.search({
        index: 'logstash-2019.08.24-000001',
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
            query: {
                match: {
                    "loc_name": request.query.term
                }
            },
            _source: ["id", "type", "message", "loc_postal_code", "loc_name", "province_name"],
            size: defaultSize
        }
    });

    response.send(body.hits.hits);
});

// Listen to port: 3000
app.listen(3000);