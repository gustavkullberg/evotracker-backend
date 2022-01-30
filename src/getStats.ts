import { getGameInfos } from "./getGameInfo"
import { getDailyTimeSeries, getMinutesTimeSeries } from "./getTimeSeries"
import { calculateMovingAverage } from "./services/calculateMovingAverage"

type Entry = {
    game: string;
    value: number;
}
type Stats = {
    athList: Entry[];
    topLive: Entry[];
    highestWeeklyRelative: Entry[];
    highestMonthlyRelative: Entry[];
    highestQuarterlyRelative: Entry[];
}

const getHighestRelative = (timeSeries, timeSpan) => {
    const dailyAverages = timeSeries.map(t => t.dailyAverages);
    const games = dailyAverages.length > 0 ? Object.keys(dailyAverages[dailyAverages.length - 1]) : [];

    return games.map(game => {
        const tsGame = timeSeries.map(t => t.dailyAverages[game]);
        const average = calculateMovingAverage(tsGame, timeSpan);
        const value = average[average.length - 1] / average[average.length - (timeSpan + 1)];

        if (average[average.length - 1] > 10) {
            return { game, value }
        }
    })
        .filter(g => g)
        .filter(a => a.value)
        .sort((lhs, rhs) => rhs.value > lhs.value ? 1 : -1)
}

export const getStats = async () => {
    const date = new Date(0);
    const ts = await getDailyTimeSeries(date);
    const highestMonthlyRelative = getHighestRelative(ts, 30);
    const highestWeeklyRelative = getHighestRelative(ts, 7);
    const highestQuarterlyRelative = getHighestRelative(ts, 90);
    const minutesTimeSeries = await getMinutesTimeSeries(new Date(0));
    const latest = minutesTimeSeries[minutesTimeSeries.length - 1]
    const topLive = latest ? Object.keys(latest.entry)
        .map(l => ({ game: l, value: latest.entry[l] }))
        .sort((lhs, rhs) => rhs.value > lhs.value ? 1 : -1) : []

    const gameInfos = await getGameInfos();
    const athList = gameInfos ? gameInfos
        .map(g => ({ game: g.game, timeStamp: g.ath.timeStamp, value: g.ath.value }))
        .sort((lhs, rhs) => rhs.value > lhs.value ? 1 : -1)
        : []

    const stats: Stats = {
        athList,
        topLive,
        highestWeeklyRelative,
        highestMonthlyRelative,
        highestQuarterlyRelative
    }

    return stats;
}