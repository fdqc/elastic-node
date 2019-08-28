# About this repository
This project was made to test Elasticsearch with it's Node.js client.
The project uses Elasticsearch and Kibana version 7.3 and you can get them here: <a href="https://www.elastic.co" target="_blank">Elasticsearch</a>

You can find the code of the app is inside `app` directory. And the `locations.json` for the autocomplete is inside `resources` directory.

### Prepare the server
To put import the `.json` file into Elasticsearch you should open Kibana, then go to the Dev Tools console and create an index with the following:
```
PUT /my_index
{
    "settings" : {
        "number_of_shards" : 1,
        "index" : {
            "analysis": {
                "analyzer": {
                    "trigram": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": ["lowercase","shingle"]
                    },
                    "reverse": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": ["lowercase","reverse"]
                    }
                },
                "filter": {
                    "shingle": {
                        "type": "shingle",
                        "min_shingle_size": 2,
                        "max_shingle_size": 3
                    }
                }
            }
        }
    },
    "mappings" : {
        "properties": {
            "loc_name": {
                "type": "text",
                "fields": {
                    "trigram": {
                        "type": "text",
                        "analyzer": "trigram"
                    },
                    "reverse": {
                        "type": "text",
                        "analyzer": "reverse"
                    }
                }
            }
        }
    }
}
```

Next go into your Elasticsearch directory and run to start the server:
```
~/Programs/elasticsearch-7.3.1/bin$ ./elasticsearch
```

Finally, go to the directory where you downloaded the `.json` file and in the console run:
```
curl -H "Content-Type: application/json" -X POST "localhost:9200/my_index/_bulk?pretty&refresh" --data-binary "@locations.json"
```

### How to run the project
Open another tab and go into the app directory and run:
```
$ nodemon index.js
```
If you don't have nodemon, you can install it by runing:
```
$ npm install -g nodemon
```
Finally open your default web browser at http://localhost:3000/ and you should be able to see and interact with an autocomplete input field to search Argentinas locations.