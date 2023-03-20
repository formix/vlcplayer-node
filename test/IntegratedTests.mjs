import { VlcPlayer, sleep } from "../lib/index.mjs";

let mediasHome = "/var/xcape/videos/";
const VIDEOS = {
    BadWeather: `${mediasHome}Wizard-of-Oz-Tornado-2019_sc02_067_v001_BUFFER1-1080.mp4`, // 20 seconds
    Tornado: `${mediasHome}Wizard-of-Oz-Tornado-2019_sc02_067_v001_TRIGGER1-1080.mp4`,   // 20 seconds
    Flying: `${mediasHome}Wizard-of-Oz-Tornado-2019_sc02_067_v001_BUFFER2-1080.mp4`,     // 20 seconds
    FallDown: `${mediasHome}Wizard-of-Oz-Tornado-2019_sc02_067_v001_TRIGGER2-1080.mp4`,  // 13 seconds
    CropField: `${mediasHome}Wizard-of-Oz-Tornado-2019_sc02_067_v001_BUFFER3-1080.mp4`   // 20 seconds
};

let player = new VlcPlayer();
await player.open();
for (let key in VIDEOS) {
    await player.add(VIDEOS[key]);
}
console.log("Waiting 5 seconds before starting...");
await sleep(5);
await player.play(VIDEOS.BadWeather);
await player.repeat("on");
await sleep(25);
await player.play(VIDEOS.Tornado);
await player.repeat("off");
await sleep(22);
await player.repeat("on");
await sleep(30);
await player.play(VIDEOS.FallDown);
await player.repeat("off");
await sleep(15);
await player.repeat("on");
await sleep(30);
await player.close();


