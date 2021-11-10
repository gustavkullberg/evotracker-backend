const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const getDb = async () => {
    if (!client.isConnected()) await client.connect();
    return client.db("gameshowstats");
}

module.exports = { getDb }