import { spawn } from "node:child_process";
import fs from "node:fs";
import { promisify } from "util";

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
     * over the display until the first media is enqueueed to the playlist.
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
            return resolve();
        });
    }

    /**
     * Start playing after being paused or enqueue the given file at the end of
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
                await this.enqueue(mediaPath);
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
     * Enqueue the specified media at the end of the playlist.
     * 
     * @param {string} mediaPath The path of the media to play.
     */
    async enqueue(mediaPath) {
        if (!fs.existsSync(mediaPath)) {
            throw new Error(`Media '${mediaPath}' not found.`);
        }
        if (this._playlist.has(mediaPath)) {
            throw new Error(`Media '${mediaPath}' already in the playlist.`);
        }
        this._playlist.set(mediaPath, this._playlistIndex);
        this._playlistIndex++;
        await this.exec(`enqueue ${mediaPath}`);
    }

    /**
     * Turns the repeat mode on or off. Loop over the current media until turned off.
     * 
     * @param {string|boolean} [value=true] - Set the repeat mode on or off. Accepts true, false, 'on', 'off'.
     */
    async repeat(value = true) {
        let mode = _onoff(value);
        await this.exec(`repeat ${mode}`);
    }

    /**
     * Turns the loop mode on or off. Loop over the whole playlist in order.
     * 
     * @param {string|boolean} [value=true] - Set the loop mode on or off. Accepts true, false, 'on', 'off'.
     */
    async loop(value = true) {
        let mode = _onoff(value);
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
    exec(command) {
        return new Promise((resolve, reject) => {
            if (!command) {
                return reject("The command parameter must be provided.");
            }
            this._vlc.stdin.write(`${command}\n`, err => {
                if (err) reject(err);
                return resolve();
            });
        });
    }
}

/**
 * Sleep for a given number of seconds. Given the NodeJS way of handling asynchonous calls, the
 * time specified is a minimum. It means that the sleep function will return some time after the
 * specified period elapsed.
 * 
 * @param {number} period - How long the sleep should last in seconds.
 */
export async function sleep(period) {
    await _msleep(period * 1000);
};

const _msleep = (time => new Promise(r => setTimeout(r, time)));

function _onoff(value) {
    if ((value || value === undefined) && value !== "off") {
        return "on";
    }
    return "off";
}