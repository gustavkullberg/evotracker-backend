const dotenv = require("dotenv");
dotenv.config();

const { getMinutesTimeSeries, getDailyTimeSeries } = require("./getTimeSeries")
const { getGameInfo, getGameInfos } = require("././getGameInfo")
const express = require('express')
const app = express()


app.get('/timeSeries/minutes', async function (req, res) {
    res.send(await getMinutesTimeSeries())
})

app.get('/timeSeries/daily', async function (req, res) {
    res.send(await getDailyTimeSeries())
})

app.get('/gameInfos', async function (req, res) {
    res.send(await getGameInfos())
})

app.get('/gameInfos/:game', async function (req, res) {
    res.send(await getGameInfo(req.params.game))
})

app.listen(3000);