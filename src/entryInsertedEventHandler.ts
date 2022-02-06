import axios from "axios";
import { queryAthEvents } from "./getAthEvents";
import { queryGameInfos } from "./getGameInfo";
import { queryMinutesTimeSeries, queryDailyTimeSeries } from "./getTimeSeries";

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
        return;
    }
    console.log("No match for messagetype")
}