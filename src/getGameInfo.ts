import { CRON_JOB_INTERVAL_MINUTES } from "./constants";
import { getDb, mongoQueryTime } from "./db";
const CronJob = require('cron').CronJob;

const cache = { value: null, expiryTimeStamp: null }

export const gameInfosJob = new CronJob(`*/${CRON_JOB_INTERVAL_MINUTES} * * * *`, async () => {
    console.log(new Date().toISOString(), "Fetching gameInfos")
    const end = mongoQueryTime.startTimer();
    const db = await getDb();
    cache.value = await db.collection("gameInfo").find().toArray();
    end({ type: "getInfo_find" })
}, null, true);


export const getGameInfo = async (game) => {
    const gameInfos = await getGameInfos();
    return gameInfos.find(g => g.game === game)
}

export const getGameInfos = async () => {
    return cache.value
}