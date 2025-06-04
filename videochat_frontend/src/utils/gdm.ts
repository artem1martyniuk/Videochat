import displayMediaOptions from "../config/trackConfig/displayMediaOptions.ts";

const gdm = async () => {
    return navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
}

export default gdm;