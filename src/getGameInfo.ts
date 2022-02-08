import { getDb, mongoQueryTime } from "./db";

const cache = { value: null, expiryTimeStamp: null }

export const queryGameInfos = async () => {
    const end = mongoQueryTime.startTimer();
    const db = await getDb();
    cache.value = await db.collection("gameInfo").find().toArray();
    console.log(new Date().toISOString(), "Fetched gameInfos")
    end({ type: "getInfo_find" })
}


export const getGameInfo = async (game) => {
    const gameInfos = await getGameInfos();
    return gameInfos.find(g => g.game === game)
}

export const getGameInfos = async () => {
    return cache.value
}