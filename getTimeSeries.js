const { getDb } = require("./db");
const minutesCollection = 'evostats';
const dailyAverageCollection = "dailyHistoryEvoStats"
const CronJob = require('cron').CronJob;


const minutesCache = { value: null }
const dailyCache = { value: null }

const minutesTimeSeriesJob = new CronJob('*/4 * * * *', async () => {
    console.log(new Date().toISOString(), "Fetching minutes timeseries")
    const db = await getDb();
    const now = new Date();
    const dateSevenDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString();
    minutesCache.value = await db.collection(minutesCollection).find({ "timeStamp": { $gt: dateSevenDaysAgo } }).toArray();
}, null, true);

const dailyTimeSeriesJob = new CronJob('*/4 * * * *', async () => {
    console.log(new Date().toISOString(), "Fetching daily timeseries")
    const db = await getDb();
    dailyCache.value = await db.collection(dailyAverageCollection).find().sort({ date: 1 }).toArray();
}, null, true);

const getMinutesTimeSeries = async () => {
    return minutesCache.value;
}


const getDailyTimeSeries = async () => {
    return dailyCache.value;
}

module.exports = { getMinutesTimeSeries, getDailyTimeSeries, dailyTimeSeriesJob, minutesTimeSeriesJob };