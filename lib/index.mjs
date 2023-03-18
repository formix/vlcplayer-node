import { spawn } from "node:child_process";
import { setMaxIdleHTTPParsers } from "node:http";

const sleep = (time => new Promise(r => setTimeout(r, time)));

/**
 * 
 */
export class VlcPlayer {

    /**
     * 
     */
    constructor() {
        this._executable = "cvlc";
        if (process.platform === "win32") {
            this._executable = "vlc.exe"
        }
    }

    /**
     * Opens the VLC media player and start playing the given file.
     * 
     * @param {string=} filePath - The file to play.
     */
    async open() {
        let options = [
            "--no-video-title-show",
            "-I", "rc"
        ];
        this._vlc = spawn(this._executable, options);
        while (!this._vlc.pid) {
            await sleep(10);
        }
        this._vlc.stdout.on("data", data => {
            process.stdout.write(data);
        });
        this._vlc.stderr.on("data", data => {
            process.stderr.write(data);
        });
        this._rc = this._vlc.stdin;
        this._rc.write("playlist\n");
    }

    play(filePath, repeat = false) {
    }

    /**
     * Terminate the VLC process.
     */
    async close() {
        this._rc.end("quit\n");
        this._vlc = undefined;
        this._rc = undefined;
    }
}