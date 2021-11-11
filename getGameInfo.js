const { getDb } = require("./db");
const CronJob = require('cron').CronJob;

const cache = { value: null, expiryTimeStamp: null }

const gameInfosJob = new CronJob('*/4 * * * *', async () => {
    console.log(new Date().toISOString(), "Fetching gameInfos")
    const db = await getDb();
    cache.value = await db.collection("gameInfo").find().toArray();
}, null, true);


const getGameInfo = async (game) => {
    const gameInfos = await getGameInfos();
    return gameInfos.find(g => g.game === game)
}

const getGameInfos = async () => {
    return cache.value
}

module.exports = { getGameInfos, getGameInfo, gameInfosJob };