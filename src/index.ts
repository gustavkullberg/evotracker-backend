import dotenv from "dotenv";
dotenv.config();

import { minutesTimeSeriesJob, dailyTimeSeriesJob, getMinutesTimeSeriesForGame, queryMinutesTimeSeries, queryDailyTimeSeries, getDailyTimeSeriesForGame, getMonthlyTimeSeriesForGame } from "./getTimeSeries";
import { gameInfosJob, queryGameInfos } from "./getGameInfo";
import express from 'express';
import { Response } from 'express';
import client from 'prom-client';
import { mongoQueryTime } from "./db";
import { getStats } from "./getStats";
import { getStatsForGame } from "./getStatsById";
import { athEventsJob, getAthEvents, queryAthEvents } from "./getAthEvents";
const app = express()

const httpRequestTimer = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code', "game"],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpResponseSize = new client.Histogram({
    name: 'http_response_size',
    help: 'Size of HTTP response in bytes',
    labelNames: ['method', 'route', 'code'],
    buckets: [1000, 10000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 100000000]
});

const register = new client.Registry();
client.collectDefaultMetrics({ register });
register.registerMetric(httpRequestTimer);
register.registerMetric(mongoQueryTime);
register.registerMetric(httpResponseSize);


client.collectDefaultMetrics({
    prefix: 'node_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register
});


app.get('/metrics', async function (req, res: Response) {
    res.setHeader('Content-Type', register.contentType)
    res.send(await register.metrics());
})

app.get('/stats', async function (req, res: Response) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;
    res.send(await getStats())
    const headers = res.getHeaders()
    const content_length = headers["content-length"]?.toString() ? parseInt(headers["content-length"].toString()) : 0;
    if (content_length > 0) {
        httpResponseSize.labels({ route, method: req.method }).observe(content_length);
    }
    end({ route, code: res.statusCode, method: req.method });
})

app.get('/games/:game/timeSeries/minutes', async function (req, res: Response) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    const startDate = new Date(req.query.startDate?.toString() || 0);
    res.send(await getMinutesTimeSeriesForGame(req.params.game, startDate))
    const headers = res.getHeaders()
    const content_length = headers["content-length"]?.toString() ? parseInt(headers["content-length"].toString()) : 0;
    if (content_length > 0) {
        httpResponseSize.labels({ route, method: req.method }).observe(content_length);
    }
    end({ route, code: res.statusCode, method: req.method });
})

app.get('/games/:game/timeSeries/daily', async function (req, res: Response) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    const startDate = new Date(req.query.startDate?.toString() || 0);
    res.send(await getDailyTimeSeriesForGame(req.params.game, startDate))
    const headers = res.getHeaders()
    const content_length = headers["content-length"]?.toString() ? parseInt(headers["content-length"].toString()) : 0;
    if (content_length > 0) {
        httpResponseSize.labels({ route, method: req.method }).observe(content_length);
    }
    end({ route, code: res.statusCode, method: req.method });
})

app.get('/games/:game/timeSeries/monthly', async function (req, res: Response) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    const startDate = new Date(req.query.startDate?.toString() || 0);
    res.send(await getMonthlyTimeSeriesForGame(req.params.game, startDate))
    const headers = res.getHeaders()
    const content_length = headers["content-length"]?.toString() ? parseInt(headers["content-length"].toString()) : 0;
    if (content_length > 0) {
        httpResponseSize.labels({ route, method: req.method }).observe(content_length);
    }
    end({ route, code: res.statusCode, method: req.method });
})

app.get('/games/:game/stats', async function (req, res: Response) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    res.send(await getStatsForGame(req.params.game))
    const headers = res.getHeaders()
    const content_length = headers["content-length"]?.toString() ? parseInt(headers["content-length"].toString()) : 0;
    if (content_length > 0) {
        httpResponseSize.labels({ route, method: req.method }).observe(content_length);
    }
    end({ route, code: res.statusCode, method: req.method, game: req.params.game });
})

app.get('/events/allTimeHighs', async function (req, res: Response) {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;

    res.send(await getAthEvents());
    const headers = res.getHeaders()
    const content_length = headers["content-length"]?.toString() ? parseInt(headers["content-length"].toString()) : 0;
    if (content_length > 0) {
        httpResponseSize.labels({ route, method: req.method }).observe(content_length);
    }
    end({ route, code: res.statusCode, method: req.method });
})

const port = 8080;
app.listen(port, "", () => {
    queryAthEvents();
    queryGameInfos();
    queryMinutesTimeSeries();
    queryDailyTimeSeries();

    minutesTimeSeriesJob.start();
    dailyTimeSeriesJob.start();
    gameInfosJob.start();
    athEventsJob.start();

    console.log(`Started serving on port ${port} :) `)
});