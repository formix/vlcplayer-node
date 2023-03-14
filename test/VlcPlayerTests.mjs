import assert from "assert";
import {VlcPlayer} from "../src/index.mjs";


describe("VlcPlayer", async () => {
    describe("#open()", async () => 
        it("Should start a new player with the given stream", async () => {
            let player = new VlcPlayer();
            player.open("D:\\tests\\vlcplayer\\window-01-initial.mp4");
            assert.equal(true, player._vlc.pid > 0);
            await sleep(2000);
            player.close();
        }));

    describe("#play()", async () => 
        it("Should start a new player whith a stream the play another one.", async () => {
            let player = new VlcPlayer();
            player.open("D:\\tests\\vlcplayer\\window-01-initial.mp4");
            assert.equal(true, player._vlc.pid > 0);
            await sleep(3000);
            player.play("D:\\tests\\vlcplayer\\window-02-storm-begin.mp4");
            await sleep(2000);
            player.close();
        }));
    }
);


const sleep = (time => new Promise(r => setTimeout(r, time)));