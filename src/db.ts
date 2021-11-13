import { MongoClient } from 'mongodb';

import promclient from 'prom-client';

export const mongoQueryTime = new promclient.Histogram({
    name: 'mongo_query_duration_seconds',
    help: 'Duration of Mongo queries in seconds',
    labelNames: ['type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
});

const client = new MongoClient(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export const getDb = async () => {
    if (!client.isConnected()) await client.connect();
    return client.db("gameshowstats");
}