import axios from "axios";

export const handle = async (messageType, message) => {
    console.log(messageType);
    if (messageType === "SubscriptionConfirmation") {
        console.log("confirmation", message);
        try {
            await axios.get(message.SubscribeURL);
        } catch (e) {
            console.log(e)
        }

        return;
    }
    if (messageType === "Notification") {
        console.log("notification", message);
        return;
    }
    console.log("No match for messagetype")
}