import { getGameInfo } from "./getGameInfo"
import { getDailyTimeSeries, getMinutesTimeSeries, getMinutesTimeSeriesForGame } from "./getTimeSeries"
import { calculateMovingAverage } from "./services/calculateMovingAverage";

const getDaysOfTheWeekStats = async (game: string, ts) => {
    const entries = ts.map(t => ({ timeStamp: t.date, value: t.dailyAverages[game] })).filter(t => t.value);

    const entryByDay = entries.reduce((acc, obj) => {
        const day = new Date(obj.timeStamp).getDay();
        if (acc[day]) {
            acc[day].push(obj)
        } else {
            acc[day] = [{ ...obj }]
        }
        return acc;
    }, {});

    return Object.keys(entryByDay).map(day => {
        const res = calculateMovingAverage(entryByDay[day].map(e => e.value), 26)
        return { value: res[res.length - 1], day }

    });
}
const getAverageForGame = (timeSeries, game, timeSpan) => {
    const tsGame = timeSeries.map(t => t.dailyAverages[game]);
    const average = calculateMovingAverage(tsGame, timeSpan);
    return {
        value: average[average.length - 1],
        delta: average[average.length - 1] / average[average.length - (timeSpan + 1)]
    }
}


export const getStatsForGame = async (game) => {
    const date = new Date(0);
    const ts = await getDailyTimeSeries(date);
    const ma90 = getAverageForGame(ts, game, 90);
    const ma30 = getAverageForGame(ts, game, 30);
    const ma7 = getAverageForGame(ts, game, 7);

    const minutesTimeSeries = await getMinutesTimeSeriesForGame(game, new Date(0));
    const livePlayers = minutesTimeSeries[minutesTimeSeries.length - 1]

    const gameInfo = await getGameInfo(game);
    const ath = gameInfo ? gameInfo.ath : 0;

    const dotWStats = await getDaysOfTheWeekStats(game, ts);

    const timeSeries = await getMinutesTimeSeries(new Date(0));
    const latestTimeSeries = timeSeries[timeSeries.length - 1];
    const sortableArray = Object.keys(latestTimeSeries.entry).map(game => ({ game, value: latestTimeSeries.entry[game] }))
    const sortedArray = sortableArray.sort((l, r) => l.value < r.value ? 1 : -1);
    const rank = sortedArray.findIndex(s => s.game === game) + 1;

    return {
        ma90,
        ma30,
        ma7,
        ath,
        dotWStats,
        livePlayers,
        rank
    }
}