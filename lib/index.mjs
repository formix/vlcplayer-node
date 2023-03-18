import { spawn } from "node:child_process";
import fs from "node:fs";

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
        this._lastCommandOutput = "";
        this._lastCommandError = "";
        this._executionDone = null;
        this._playlist = new Map();
        this._playlistIndex = 3;
    }

    /**
     * Open the VLC media player with an empty playlist.
     */
    async open() {
        let options = [
            "--no-video-title-show",
            "-I", "rc"
        ];
        this._vlc = spawn(this._executable, options);
        this._vlc.stdout.on("data", data => {
            this._lastCommandOutput += data.toString("utf8");
            if (this._executionDone && (
                    this._lastCommandOutput.endsWith("> ") ||
                    this._lastCommandOutput.trimEnd() === "Shutting down.")) {
                this._executionDone();
            }
        });
        this._vlc.stderr.on("data", data => {
            this._lastCommandError += data.toString("utf8");
        });
        this._rc = this._vlc.stdin;
    }

    async play(filePath) {
        if (!this._playlist.has(filePath)) {
            await this.add(filePath);
        }
        let index = this._playlist.get(filePath);
        await this.exec(`goto ${index}`);
    }

    async add(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File '${filePath}' not found.`);
        }
        if (!this._playlist.has(filePath)) {
            throw new Error(`File '${filePath}' already in the playlist.`);
        }
        this._playlist.set(filePath, this._playlistIndex);
        this._playlistIndex++;
        await this.exec(`add ${filePath}`);
    }

    /**
     * Terminate the VLC process.
     */
    async close() {
        await this.exec("quit");
        this._vlc = undefined;
        this._rc = undefined;
    }

    async exec(command) {
        return new Promise((resolve, _) => {
            this._lastCommandOutput = "";
            this._lastCommandError = "";
            this._executionDone = resolve;
            this._rc.write(`${command}\n`);
        });
    }
}