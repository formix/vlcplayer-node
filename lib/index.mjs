import { spawn } from "node:child_process";
import fs from "node:fs";
import { promisify } from "util";

const sleep = (time => new Promise(r => setTimeout(r, time)));

/**
 * A wrapper over the remote control interface of VLC.
 */
export class VlcPlayer {

    /**
     * Create a new instance of the player.
     * 
     * @param {boolean=false} verbose - Tell if the VLC error stream should be relayed to the current process error stream.
     */
    constructor(verbose = false) {
        this._verbose = verbose;
        this._playlist = new Map();
        this._playlistIndex = 3;
    }

    /**
     * Open the VLC media player with an empty playlist. VLC will not take
     * over the display until the first media is added to the playlist.
     */
    async open() {
        return new Promise((resolve, reject) => {
            let options = [
                "-f",
                "--no-video-title-show",
                "-I", "rc"
            ];
            try {
                this._vlc = spawn("cvlc", options);
            } 
            catch (err) {
                return reject(err);
            }
            if (this._verbose) {
                this._vlc.stderr.on("data", data => process.stderr.write(data));
            }
            this._writecmd = promisify(this._vlc.stdin.write);
            return resolve();
        });
    }

    /**
     * Start playing after being paused or add the given file at the end of
     * the playlist and start playing it. If the file is already in the
     * playlist, jump to that media position in the playlist instead.
     * 
     * @param {string=} mediaPath - If unspecified, resumes the running video. If a valid media path is specified, start playing that media.
     */
    async play(mediaPath) {
        if (!mediaPath) {
            await this.exec("play");
        }
        else {
            if (!this._playlist.has(mediaPath)) {
                await this.add(mediaPath);
            }
            let index = this._playlist.get(mediaPath);
            await this.exec(`goto ${index}`);
        }
    }

    /**
     * Pause the current media.
     */
    async pause() {
        await this.exec("pause");
    }

    /**
     * Add the specified media at the end of the playlist. Pause the media
     * if it is the first one.
     * 
     * @param {string} mediaPath The path of the media to play.
     */
    async add(mediaPath) {
        if (!fs.existsSync(mediaPath)) {
            throw new Error(`Media '${mediaPath}' not found.`);
        }
        if (this._playlist.has(mediaPath)) {
            throw new Error(`Media '${mediaPath}' already in the playlist.`);
        }
        let firstFile = this._playlistIndex === 3;
        this._playlist.set(mediaPath, this._playlistIndex);
        this._playlistIndex++;
        await this.exec(`add ${mediaPath}`);
        if (firstFile) {
            await this.exec("pause");
        }
    }

    /**
     * Turns the repeat mode on or off.
     * 
     * @param {string|boolean} [value=true] - Set the repeat mode on or off. Accepts true, false, 'on', 'off'.
     */
    async repeat(value = true) {
        let mode = onoff(value);
        await this.exec(`repeat ${mode}`);
    }

    /**
     * Turns the loop mode on or off.
     * 
     * @param {string|boolean} [value=true] - Set the loop mode on or off. Accepts true, false, 'on', 'off'.
     */
    async loop(value = true) {
        let mode = onoff(value);
        await this.exec(`loop ${mode}`);
    }

    /**
     * Terminate the VLC process.
     */
    async close() {
        await this.exec("quit");
        this._vlc = undefined;
    }

    /**
     * Execute any command that the rc (lua) console interface can accept.
     * 
     * @param {string} command - The command to execute.
     */
    async exec(command) {
        if (!command) {
            throw new Error("The command parameter must be provided.");
        }
        let retries = 0;
        let writeSuccess = false;
        while (!writeSuccess && retries < 10) {
            if (retries > 0) await sleep(50);
            retries++;
            writeSuccess = await this._writecmd(`${command}\n`);
        }
    }
}

function onoff(value) {
    if ((value || value === undefined) && value !== "off") {
        return "on";
    }
    return "off";
}