import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export const getDb = async () => {
    if (!client.isConnected()) await client.connect();
    return client.db("gameshowstats");
}