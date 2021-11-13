import { CRON_JOB_INTERVAL_MINUTES } from "./constants";
import { getDb, mongoQueryTime } from "./db";
const CronJob = require('cron').CronJob;

const minutesCollection = 'evostats';
const dailyAverageCollection = "dailyHistoryEvoStats"

const minutesCache = { value: null as any[] }
const dailyCache = { value: null }

export const minutesTimeSeriesJob = new CronJob(`*/${CRON_JOB_INTERVAL_MINUTES} * * * *`, async () => {
    const end = mongoQueryTime.startTimer();
    const db = await getDb();
    const now = new Date();
    const dateTenDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString();
    minutesCache.value = await db.collection(minutesCollection).find({ "timeStamp": { $gt: dateTenDaysAgo } }).toArray();
    console.log(new Date().toISOString(), "Fetched minutes timeseries")
    end({ type: "evostats_find_timestamp_gt_daysago" })
}, null, true);

export const dailyTimeSeriesJob = new CronJob(`*/${CRON_JOB_INTERVAL_MINUTES} * * * *`, async () => {
    const end = mongoQueryTime.startTimer();
    const db = await getDb();
    dailyCache.value = await db.collection(dailyAverageCollection).find().sort({ date: 1 }).toArray();
    console.log(new Date().toISOString(), "Fetched daily timeseries")
    end({ type: "dailyHistoryEvoStats_find_sort" })
}, null, true);

export const getMinutesTimeSeries = async () => {
    return minutesCache.value;
}

export const getMinutesTimeSeriesForGame = async (game: string) => {
    return minutesCache.value?.map(a => ({ timeStamp: a.timeStamp, value: a.entry[game] })) || []
}

export const getDailyTimeSeries = async () => {
    return dailyCache.value;
}