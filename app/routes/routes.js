var express = require('express');
const router = express.Router();

const { Client } = require('@elastic/elasticsearch');
// Define the elasticSearch client
const client = new Client({ node: 'http://localhost:9200' });
// Define de index name
const elasticSearchIndex = 'my_index';

/**
 * Returns a list of locations
 * the default size is 10
 * 
 * @returns json[]
 */
router.get('/locations', async function (request, response) {
    let defaultSize = 10;

    // search for all the locations in the index
    const { body } = await client.search({
        index: elasticSearchIndex,
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
            query: {
                match_all: {}
            },
            _source: ["id", "type", "message", "loc_postal_code", "loc_name", "province_name"],
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
router.get('/locations-autocomplete', async function (request, response) {
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
router.get('/location/suggest', async function (request, response) {
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
                        size: 1,
                        gram_size: 3,
                        direct_generator: [{
                            field: "loc_name.trigram",
                            prefix_length: 0,
                            suggest_mode: "missing"
                        }],
                        highlight: {
                            pre_tag: "<em>",
                            post_tag: "</em>"
                        },
                        collate: {
                            query: {
                                source: {
                                    match: {
                                        "{{field_name}}": "{{suggestion}}"
                                    }
                                }
                            },
                            params: { "field_name": "loc_name" },
                            prune: true
                        },
                        smoothing: {
                            laplace: {
                                alpha: 0.7
                            }
                        }
                    }
                }
            }
        }
    });

    response.send(body.suggest.simple_phrase[0].options);
});

/**
 * Searches for locations matching the provided term
 * or makes a suggestion for the autocomplete
 * @param term string
 * @returns json[]
 */
router.get('/location/search-and-suggest', async function (request, response) {
    // search for suggestions for location name in
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
            suggest: {
                text: request.query.term,
                simple_phrase: {
                    phrase: {
                        field: "loc_name.trigram",
                        size: 1,
                        gram_size: 3,
                        direct_generator: [{
                            field: "loc_name.trigram",
                            prefix_length: 0,
                            suggest_mode: "missing"
                        }],
                        highlight: {
                            pre_tag: "<em>",
                            post_tag: "</em>"
                        },
                        collate: {
                            query: {
                                source: {
                                    match: {
                                        "{{field_name}}": "{{suggestion}}"
                                    }
                                }
                            },
                            params: { "field_name": "loc_name" },
                            prune: true
                        },
                        smoothing: {
                            laplace: {
                                alpha: 0.7
                            }
                        }
                    }
                }
            }
        }
    });

    if (body.hits.hits.length > 0) {
        response.send(body.hits.hits);
    } else {
        response.send(body.suggest.simple_phrase[0].options);
    }
});

module.exports = router;