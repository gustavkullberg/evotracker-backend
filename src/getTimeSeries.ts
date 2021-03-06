import { getDb, mongoQueryTime } from "./db";
import { groupBy } from "./services/groupBy";

type Entry = {
    timeStamp: Date,
    value: number
}

const latestDataSourceChange = "2021-12-22"

const minutesCollection = 'evostats';
const dailyAverageCollection = "dailyHistoryEvoStats"

export const minutesCache = { value: null as any[] }
const dailyCache = { value: null as any[] }

const addAllShows = (value: any[]): any[] => {
    return value.map(v => {
        return { ...v, entry: { ...v.entry, 'All Shows': Object.values(v.entry).reduce((res2: number, obj2: number) => res2 + obj2, 0) } }
    });
}

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
    minutesCache.value = addAllShows(minutesCache.value);
    console.log(new Date().toISOString(), "Fetched minutes timeseries")
    end({ type: "evostats_find_timestamp_gt_daysago" })
}

export const getMinutesTimeSeries = async (startDate: Date) => {
    return minutesCache.value?.filter(entry => entry.timeStamp > startDate.toISOString()) || []
}

export const getMinutesTimeSeriesForGame = async (game: string, startDate: Date): Promise<Entry[]> => {
    return minutesCache.value
        ?.map(a => ({ timeStamp: a.timeStamp, value: a?.entry[game] }))
        ?.filter(entry => entry.timeStamp > startDate.toISOString()) || []
}

export const getDailyTimeSeries = async (startDate: Date) => {
    const res = dailyCache.value?.filter(entry => entry.date > startDate.toISOString()) || []
    return res;
}

export const getDailyTimeSeriesForGame = async (game: string, startDate: Date) => {
    const res = dailyCache.value
        ?.filter(entry => entry.date > startDate.toISOString())
        ?.map(a => ({ timeStamp: a.date, average: a.dailyAverages[game], max: a.dailyMaxes[game] }))
        .filter(x => !!x.average)

    if (game === "All Shows") {
        return res.filter(r => r.timeStamp > latestDataSourceChange);
    }

    res.shift();
    return res;
}

export const getMonthlyTimeSeriesForGame = async (game: string, startDate: Date) => {
    const res = (await getMonthlyTimeSeries(startDate)).map(r => ({ timeStamp: r.date, value: r.averages[game] }))

    if (game === "All Shows") {
        return res.filter(r => r.timeStamp > latestDataSourceChange.slice(0, 7));
    }
    return res;
}

export const getMonthlyTimeSeries = async (startDate: Date) => {
    const monthlyGroups = groupBy(dailyCache.value, x => x.date.substring(0, 7))

    const result = [];
    monthlyGroups.forEach((month, idx) => {
        const averages = month.reduce((tot, obj) => {
            Object.keys(obj.dailyAverages).forEach(key => {
                if (tot[key]) {
                    tot[key] += obj.dailyAverages[key] / month.length
                } else {
                    tot[key] = obj.dailyAverages[key] / month.length
                }
            })
            return tot;
        }, {})

        result.push({ date: idx, averages })
    });
    return result;
}