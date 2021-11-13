import dotenv from "dotenv";
dotenv.config();

import { getMinutesTimeSeries, getDailyTimeSeries, minutesTimeSeriesJob, dailyTimeSeriesJob } from "./getTimeSeries";
import { getGameInfo, getGameInfos, gameInfosJob } from "././getGameInfo";
import express from 'express';
import { Request, Response } from 'express';
import client from 'prom-client';
import { mongoQueryTime } from "./db";
const app = express()

const httpRequestTimer = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code', "content_length"],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const register = new client.Registry();
client.collectDefaultMetrics({ register });
register.registerMetric(httpRequestTimer);
register.registerMetric(mongoQueryTime);


client.collectDefaultMetrics({
    prefix: 'node_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register
});


app.get('/metrics', async function (req, res: Response) {
    res.setHeader('Content-Type', register.contentType)
    res.send(await register.metrics());
})

app.get('/timeSeries/minutes', async function (req, res: Response) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    res.send(await getMinutesTimeSeries())
    const headers = res.getHeaders()
    const content_length = headers["content-length"]?.toString() || 0;
    end({ route, code: res.statusCode, method: req.method, content_length });
})

app.get('/timeSeries/daily', async function (req, res: Response) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    res.send(await getDailyTimeSeries())
    const headers = res.getHeaders()
    const content_length = headers["content-length"]?.toString() || 0;
    end({ route, code: res.statusCode, method: req.method, content_length });
})

app.get('/gameInfos', async function (req, res: Response) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;
    res.send(await getGameInfos())

    const headers = res.getHeaders()
    const content_length = headers["content-length"]?.toString() || 0;
    end({ route, code: res.statusCode, method: req.method, content_length });
})

app.get('/gameInfos/:game', async function (req, res: Response) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    res.send(await getGameInfo(req.params.game))
    const headers = res.getHeaders()
    const content_length = headers["content-length"]?.toString() || 0;
    end({ route, code: res.statusCode, method: req.method, content_length });
})
const port = 8080;
app.listen(port, "", () => {
    minutesTimeSeriesJob.start();
    dailyTimeSeriesJob.start();
    gameInfosJob.start();

    console.log(`Started serving on port ${port} :) `)
});