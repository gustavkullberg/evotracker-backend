import axios from "axios";
import { queryAthEvents } from "./getAthEvents";
import { queryGameInfos } from "./getGameInfo";
import { queryMinutesTimeSeries, queryDailyTimeSeries } from "./getTimeSeries";
import { queryPlayTech, queryPragmatic } from "./providers/getProviderStats";

export const handle = async (messageType, message) => {
    if (messageType === "SubscriptionConfirmation") {
        console.log("confirmation", message);
        try {
            await axios.get(message.SubscribeURL);
        } catch (e) {
            console.log(e.response.data)
        }

        return;
    }
    if (messageType === "Notification") {
        queryAthEvents();
        queryGameInfos();
        queryMinutesTimeSeries();
        queryDailyTimeSeries();
        queryPragmatic();
        queryPlayTech();
        return;
    }
    console.log("No match for messagetype")
}