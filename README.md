# vlcplayer-node
A library for controlling VLC player on Raspberry PI. The current version is tested on a Rapsberry
PI 2GB of RAM without any UI.

# Installation
```bash
sudo apt install vlc
npm install --save vlcplayer-node
```
# Usage
VlcPLayer is not an event emitter. Your logic have to take in consideration that you are handling
a playlist. With this paradigm, you have to take video timing in consideration if you want to
repeat a sequence or play something else based on external events. Look at the following example:

```javascript
import { VlcPlayer, sleep } from "vlcplayer-node"

let mediasHome = "/var/medias/";
const VIDEOS = {
    BadWeather: `${mediasHome}2019_sc02_067_v001_BUFFER1-1080.mp4`, // 20 seconds
    Tornado: `${mediasHome}2019_sc02_067_v001_TRIGGER1-1080.mp4`,   // 20 seconds
    Flying: `${mediasHome}2019_sc02_067_v001_BUFFER2-1080.mp4`,     // 20 seconds
    FallDown: `${mediasHome}2019_sc02_067_v001_TRIGGER2-1080.mp4`,  // 13 seconds
    CropField: `${mediasHome}2019_sc02_067_v001_BUFFER3-1080.mp4`   // 20 seconds
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
```

The code adds all the video to the playlist, in order. After the `for` loop,
the first video (`BadWeather`) is displayed in the paused state. Then the
whole thing is played in that sequence:

  1. The `BadWeather` video is played for 25 seconds.
  2. Activate the repeat mode for the video that is actually running.
  3. Sleep 25 seconds. Since `BadWather` is only 20 seconds long, it will repeat and play for another 5 seconds.
  4. The `Tornado` video starts.
  5. Turn off video repetion.
  6. Sleep 22 seconds. Since the `Tornado` video is 20 seconds long, the `Flying` video will start right after.
  7. Turn on video repetition. The `Flying` video will repeat itself.
  8. Waiting 30 seconds means that the `Flying` video repeats and play for another 10 seconds.
  9. Jump to the `FallDown` video.
  10. Turn off video repetion.
  11. Waiting for 15 seconds will let the player jump to `CropField` since `FallDown` duration is only 13 seconds.
  12. Turn on video repetition. The `CropField` video will repeat itself.
  13. Waiting 30 seconds means that the `CropField` video repeats and play for another 10 seconds.
  14. The player shuts down.

From there, you got the gist of it. You could as well repeat the whole sequence bye wrapping 1-12
into a while loop instead of closing. You could aso leave the `CropField` video run indefinitely
or until a given event.

I developped this module after the OMX Player deprecation for my escape games consulting work.
Tested and working on Raspberry PI 4 with the minimal Raspbian image (console only).