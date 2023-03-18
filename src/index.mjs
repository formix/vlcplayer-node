import { spawn } from "node:child_process";
import { Telnet } from "telnet-client";
import fs from "fs";

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
        this._rc = new Telnet();
    }

    /**
     * Opens the VLC media player and start playing the given file.
     * 
     * @param {string=} filePath - The file to play.
     */
    async open(filePath, repeat = false) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File '${filePath}' does not exist.`);
        }
        if (this._vlc) {
            throw new Error(`VLC Process already started PID: ${this._vlc.pid}`);
        }
        this.play(filePath, repeat);

        let options = [
            "-f",
            "--no-video-title-show",
            "-I telnet",
            "--telnet-host 127.0.0.1",
            "--telnet-password xanadu"
        ];
        this._vlc = spawn(this._executable, options);

        let res = this._rc.exec("playlist");
        console.log(res);
    }

    play(filePath, repeat = false) {
        let options = [];
        if (process.platform === "win32") {
            options.push("-f");
        }
        if (repeat) {
            options.push("--repeat");
        }
        options.push("--no-video-title-show");
        options.push(filePath);
    }

    /**
     * Terminate the VLC process.
     */
    close() {
        this._vlc.kill();
        this._vlc = undefined;
    }
}