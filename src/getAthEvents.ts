import { getDb, mongoQueryTime } from "./db";

const cache = { value: null, expiryTimeStamp: null }

export const queryAthEvents = async () => {
    const end = mongoQueryTime.startTimer();
    const db = await getDb();
    cache.value = await db.collection("athEventStore").find().sort({ timeStamp: -1 }).toArray();
    console.log(new Date().toISOString(), "Fetched athEvents")
    end({ type: "getAthEvents_find" })
}



export const getAthEvents = async () => {
    return cache.value?.slice(0, 100);
}