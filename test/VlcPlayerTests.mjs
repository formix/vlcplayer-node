import assert from "assert";
import {VlcPlayer} from "./../lib/index.mjs"


describe("VlcPlayer", async () => {
    describe("#open()", async () => 
        it("Should start a new player with the given stream", async () => {
            let player = new VlcPlayer();
            await player.open();
            assert.equal(true, player._vlc.pid > 0);
            await sleep(2000);
            await player.close();
        }));

    describe("#play()", async () => 
        it("Should start a new player whith a stream the play another one.", async () => {
            let player = new VlcPlayer();
            player.open();
            assert.equal(true, player._vlc.pid > 0);
            await sleep(3000);
            player.play();
            await sleep(2000);
            player.close();
        }));
    }
);


const sleep = (time => new Promise(r => setTimeout(r, time)));
