import { CRON_JOB_INTERVAL_MINUTES } from "./constants";
import { getDb, mongoQueryTime } from "./db";
const CronJob = require('cron').CronJob;

const minutesCollection = 'evostats';
const dailyAverageCollection = "dailyHistoryEvoStats"

const minutesCache = { value: null as any[] }
const dailyCache = { value: null }

export const queryDailyTimeSeries = async () => {
    const end = mongoQueryTime.startTimer();
    const db = await getDb();
    dailyCache.value = await db.collection(dailyAverageCollection).find().sort({ date: 1 }).toArray();
    console.log(new Date().toISOString(), "Fetched daily timeseries")
    end({ type: "dailyHistoryEvoStats_find_sort" })
}

export const queryMinutesTimeSeries = async () => {
    const end = mongoQueryTime.startTimer();
    const db = await getDb();
    const now = new Date();
    const dateTenDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString();
    minutesCache.value = await db.collection(minutesCollection).find({ "timeStamp": { $gt: dateTenDaysAgo } }).toArray();
    console.log(new Date().toISOString(), "Fetched minutes timeseries")
    end({ type: "evostats_find_timestamp_gt_daysago" })
}

export const minutesTimeSeriesJob = new CronJob(`*/${CRON_JOB_INTERVAL_MINUTES} * * * *`, async () => {
    queryMinutesTimeSeries();
}, null, true);

export const dailyTimeSeriesJob = new CronJob(`*/${CRON_JOB_INTERVAL_MINUTES} * * * *`, async () => {
    queryDailyTimeSeries();
}, null, true);

export const getMinutesTimeSeries = async (startDate: Date) => {
    return minutesCache.value?.filter(entry => entry.timeStamp > startDate.toISOString()) || []
}

export const getMinutesTimeSeriesForGame = async (game: string, startDate: Date) => {
    return minutesCache.value
        ?.map(a => ({ timeStamp: a.timeStamp, value: a.entry[game] }))
        ?.filter(entry => entry.timeStamp > startDate.toISOString()) || []
}

export const getDailyTimeSeries = async (startDate: Date) => {
    const res = dailyCache.value?.filter(entry => entry.date > startDate.toISOString()) || []
    return res;
}