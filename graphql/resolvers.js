const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const assert = require('assert');

// Connection URL
const url = 'mongodb://root:example@mongodb:27017';
//const url = 'mongodb://root:example@127.0.0.1:27017';
//const url = 'mongodb://root:example@172.18.0.2:27017';

// Database Name
const dbName = 'champions';

// Create a new MongoClient
const client = new MongoClient(url, {useUnifiedTopology: true});

const findDocuments = function (db, col, query, callback) {
    // Get the documents collection
    const collection = db.collection(col);
    // Find some documents
    collection.find(query).toArray(function (err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
}

const findOneDocument = function (db, col, query, callback) {
    // Get the documents collection
    const collection = db.collection(col);
    // Find some documents
    collection.findOne(query, function (err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
}

client.connect(function (err) {
    assert.equal(err, null);
    console.log("Connected correctly to the MongoDB server");
});


// un résolveur simple pour la requête 'books' de type Query
// qui renvoie la variable 'books'
const resolvers = {
    Query: {
        stats(root, args, context) {
            return new Promise((resolve, reject) => {
                const db = client.db(dbName);
                findDocuments(db, 'stats', {}, resolve);
            }).then(result => {
                return result
            });
        },
        classes(root, args, context) {
            return new Promise((resolve, reject) => {
                const db = client.db(dbName);
                findDocuments(db, 'classes', {}, resolve);
            }).then(result => {
                return result
            });
        }
    }
};

// on exporte la définition de 'resolvers'
module.exports = resolvers;
