import { getDb, mongoQueryTime } from "../db";
import { minutesCache } from "../getTimeSeries";

type ProviderStatistic = {
    name: string,
    numberOfGames: number,
    numberOfPlayers: number,
    shareOfPlayers: number,
}

const pragmatic = { value: null };
const playtech = { value: null };

export const queryPlayTech = async () => {
    const end = mongoQueryTime.startTimer();
    const db = await getDb();
    playtech.value = await db.collection("playtech_entries").find().toArray();
    console.log(new Date().toISOString(), "Fetched playtech")
    end({ type: "playtech_find" })
}

export const queryPragmatic = async () => {
    const end = mongoQueryTime.startTimer();
    const db = await getDb();
    pragmatic.value = await db.collection("pragmatic_entries").find().toArray();
    console.log(new Date().toISOString(), "Fetched pragmatic")
    end({ type: "pragmatic_find" })
}

const sum = (entry): number => {
    return Object.values(entry).reduce((a: number, b: number): any => a + b, 0) as number;
}

export const getProviderStats = () => {
    const playtechNofGames = Object.values(playtech.value[0].entry).length;
    const playtechNofPlayers = sum(playtech.value[0].entry)

    const pragmaticNofGames = Object.values(pragmatic.value[0].entry).length;
    const pragmaticNofPlayers = sum(pragmatic.value[0].entry)

    const evoloutionNofGames = Object.values(minutesCache.value[0].entry).length - 1;
    const evolotionNofPlayers = minutesCache.value[0].entry["All Shows"];

    const totalNofPlayers = playtechNofPlayers + pragmaticNofPlayers + evolotionNofPlayers;

    const statistics: ProviderStatistic[] = [];
    statistics.push({ name: "playtech", numberOfGames: playtechNofGames, numberOfPlayers: playtechNofPlayers, shareOfPlayers: playtechNofPlayers / totalNofPlayers });
    statistics.push({ name: "pragmatic", numberOfGames: pragmaticNofGames, numberOfPlayers: pragmaticNofPlayers, shareOfPlayers: pragmaticNofPlayers / totalNofPlayers });
    statistics.push({ name: "evolution", numberOfGames: evoloutionNofGames, numberOfPlayers: evolotionNofPlayers, shareOfPlayers: evolotionNofPlayers / totalNofPlayers });
    return statistics;
}