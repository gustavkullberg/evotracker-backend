import axios from "axios";

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
        console.log("notification", message);
        return;
    }
    console.log("No match for messagetype")
}