import {VlcPlayer} from "../lib/index.mjs"


const sleep = (time => new Promise(r => setTimeout(r, time * 1000)));

const VIDEOS = {
    BadWeather: "/var/xcape/videos/Wizard-of-Oz-Tornado-2019_sc02_067_v001_BUFFER1-1080.mp4",
    Tornado: "/var/xcape/videos/Wizard-of-Oz-Tornado-2019_sc02_067_v001_TRIGGER1-1080.mp4",
    Flying: "/var/xcape/videos/Wizard-of-Oz-Tornado-2019_sc02_067_v001_BUFFER2-1080.mp4",
    FallDown: "/var/xcape/videos/Wizard-of-Oz-Tornado-2019_sc02_067_v001_TRIGGER2-1080.mp4",
    CropField: "/var/xcape/videos/Wizard-of-Oz-Tornado-2019_sc02_067_v001_BUFFER3-1080.mp4"
};



let player = new VlcPlayer();
await player.open();
for (let key in VIDEOS) {
    await player.add(VIDEOS[key]);
}
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


