import { spawn } from "node:child_process";
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
    }

    /**
     * Opens the VLC media player and start playing the given file.
     * 
     * @param {string=} filePath - The file to play.
     */
    open(filePath, repeat = false) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File '${filePath}' does not exist.`);
        }
        if (this._vlc) {
            throw new Error(`VLC Process already started PID: ${this._vlc.pid}`);
        }
        this._vlc = this.play(filePath, repeat);
//        this._vlc.stdout.on("data", data => console.log(`STDOUT: ${data}`));
//        this._vlc.stderr.on("data", data => console.log(`STDERR: ${data}`));
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
        return spawn(this._executable, options);
    }

    /**
     * Terminate the VLC process.
     */
    close() {
        this._vlc.kill();
        this._vlc = undefined;
    }
}