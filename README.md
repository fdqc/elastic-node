# About this repository
This project was made to test Elasticsearch with it's Node.js client.
The project uses Elasticsearch and Logstash version 7.3 and you can get them here: <a href="https://www.elastic.co" target="_blank">Elasticsearch</a>

You can find the code of the app is inside `app` directory. And the locations `.csv` for the autocomplete is inside `resources` directory.

To put import the `.csv` file into Elasticsearch you can follow the next guide: 
<a href="https://medium.com/@kkirsche/using-logstash-to-import-csv-files-into-elasticsearch-d9617fa03e35" target="_blank">Using Logstash to import CSV Files Into ElasticSearch</a>

Assuming you're on Linux, your Logstash config file should look like this:
```
input {
    file {
        path => "/home/<your-username>/Downloads/argentinas_locations.csv"
        type => "location"
        start_position => "beginning"
    }
}
filter {
    csv {
        columns => ["id", "loc_name", "loc_postal_code", "province_name"]
        separator => ","
    }
}
output {
    elasticsearch {
        action => "index"
        hosts => ["localhost"]
        index => "location-test"
        workers => 1
    }
    # stdout {
        # codec => rubydebug
    # }
}
```

### How to run the project
Go into your Elasticsearch directory and run:
```
~/Programs/elasticsearch-7.3.1/bin$ ./elasticsearch
```
Open another tab and go into the app and run:
```
$ nodemon index.js
```
If you don't have nodemon, you can install it by runing:
```
$ npm install -g nodemon
```
Finally open your default web browser at http://localhost:3000/ and you should be able to see and interact with an autocomplete input field to search Argentinas locations.