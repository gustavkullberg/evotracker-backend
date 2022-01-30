import { CRON_JOB_INTERVAL_MINUTES } from "./constants";
import { getDb, mongoQueryTime } from "./db";
const CronJob = require('cron').CronJob;

const cache = { value: null, expiryTimeStamp: null }

export const queryAthEvents = async () => {
    const end = mongoQueryTime.startTimer();
    const db = await getDb();
    cache.value = await db.collection("athEventStore").find().sort({ timeStamp: -1 }).toArray();
    console.log(new Date().toISOString(), "Fetched athEvents")
    end({ type: "getAthEvents_find" })
}

export const athEventsJob = new CronJob(`*/${CRON_JOB_INTERVAL_MINUTES} * * * *`, async () => {
    await queryAthEvents();
}, null, true);


export const getAthEvents = async () => {
    return cache.value?.slice(0, 100);
}