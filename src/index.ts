import dotenv from "dotenv";
dotenv.config();

import { getMinutesTimeSeries, getDailyTimeSeries, minutesTimeSeriesJob, dailyTimeSeriesJob } from "./getTimeSeries";
import { getGameInfo, getGameInfos, gameInfosJob } from "././getGameInfo";
import express from 'express';
import client from 'prom-client';
const app = express()

const httpRequestTimer = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
});

// Create a Registry to register the metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });
register.registerMetric(httpRequestTimer);


client.collectDefaultMetrics({
    prefix: 'node_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register
});


app.get('/metrics', async function (req, res) {
    res.setHeader('Content-Type', register.contentType)
    res.send(await register.metrics());
})

app.get('/timeSeries/minutes', async function (req, res) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    res.send(await getMinutesTimeSeries())
    end({ route, code: res.statusCode, method: req.method });
})

app.get('/timeSeries/daily', async function (req, res) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    res.send(await getDailyTimeSeries())
    end({ route, code: res.statusCode, method: req.method });
})

app.get('/gameInfos', async function (req, res) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;
    res.send(await getGameInfos())

    end({ route, code: res.statusCode, method: req.method });
})

app.get('/gameInfos/:game', async function (req, res) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    res.send(await getGameInfo(req.params.game))
    end({ route, code: res.statusCode, method: req.method });
})
const port = 8080;
app.listen(port, "", () => {
    minutesTimeSeriesJob.start();
    dailyTimeSeriesJob.start();
    gameInfosJob.start();

    console.log(`Started serving on port ${port} :) `)
});