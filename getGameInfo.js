const { getDb } = require("./db");


const cache = { value: null, expiryTimeStamp: null }

const getGameInfosFromDb = async (db) => {
    return await db.collection("gameInfo").find().toArray();
}

const getGameInfo = async (game) => {
    const gameInfos = await getGameInfos();
    return gameInfos.find(g => g.game === game)
}

const getGameInfos = async () => {
    let arr;
    if (cache.expiryTimestamp && cache.expiryTimestamp.valueOf() > Date.now()) {
        arr = cache.value;
        return arr;
    };
    const db = await getDb();
    arr = await getGameInfosFromDb(db);

    const now = new Date();
    const expiryTimestamp = new Date(now.getTime() + 1000 * 60 * 5);
    cache.expiryTimestamp = expiryTimestamp;
    cache.value = arr;

    return arr;
}

module.exports = { getGameInfos, getGameInfo };