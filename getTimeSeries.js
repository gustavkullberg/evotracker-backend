const { getDb } = require("./db");
const minutesCollection = 'evostats';
const dailyAverageCollection = "dailyHistoryEvoStats"


const minutesCache = { value: null, expiryTimeStamp: null }
const dailyCache = { value: null, expiryTimeStamp: null }


const getMinutesTimeSeries = async () => {
    let arr;
    if (minutesCache.expiryTimestamp && minutesCache.expiryTimestamp.valueOf() > Date.now()) {
        arr = minutesCache.value;
        return arr;
    };
    const db = await getDb();
    const now = new Date();

    const dateSevenDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString();
    arr = await db.collection(minutesCollection).find({ "timeStamp": { $gt: dateSevenDaysAgo } }).toArray();

    const expiryTimestamp = new Date(now.getTime() + 1000 * 60 * 5);
    minutesCache.expiryTimestamp = expiryTimestamp;
    minutesCache.value = arr;

    return arr;
}


const getDailyTimeSeries = async () => {
    let arr;
    if (dailyCache.expiryTimestamp && dailyCache.expiryTimestamp.valueOf() > Date.now()) {
        arr = dailyCache.value;
        return arr;
    };
    const db = await getDb();
    const now = new Date();
    arr = await db.collection(dailyAverageCollection).find().sort({ date: 1 }).toArray();

    const expiryTimestamp = new Date(now.getTime() + 1000 * 60 * 5);
    dailyCache.expiryTimestamp = expiryTimestamp;
    dailyCache.value = arr;

    return arr;
}

module.exports = { getMinutesTimeSeries, getDailyTimeSeries };