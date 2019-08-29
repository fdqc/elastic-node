var express = require('express');
const { Client } = require('@elastic/elasticsearch');
const path = require('path');


// Run express
var app = express();
// Define the elasticSearch client
const client = new Client({ node: 'http://localhost:9200' });
// Define de index name
const elasticSearchIndex = 'my_index';

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
        index: elasticSearchIndex,
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
        index: elasticSearchIndex,
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
            query: {
                wildcard: {
                    loc_name: {
                        value: request.query.term + '*'
                    }
                }
            },
            _source: ["id", "type", "message", "loc_postal_code", "loc_name", "province_name"],
            size: defaultSize
        }
    });

    response.send(body.hits.hits);
});

/**
 * Suggest locations by the most likely spell to the
 * provided term
 * @param term string
 * @returns json[]
 */
app.get('/location/suggest', async function (request, response) {
    // search for suggestions for location name in
    // the request term
    const { body } = await client.search({
        index: elasticSearchIndex,
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
            suggest: {
                text: request.query.term,
                simple_phrase: {
                    phrase: {
                        field: "loc_name.trigram",
                        size: 5,
                        gram_size: 3,
                        direct_generator: [{
                            field: "loc_name.trigram",
                            prefix_length: 0,
                            suggest_mode: "missing"
                        }],
                        highlight: {
                            pre_tag: "<em>",
                            post_tag: "</em>"
                        }
                    }
                }
            }
        }
    });

    response.send(body.suggest.simple_phrase[0].options);
});

// Listen to port: 3000
app.listen(3000);