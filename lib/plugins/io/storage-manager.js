/*
    Storage Manager Plugin
    Adding functions to ImpactJS Game Class to manage game's data in localStorage
    Docs: https://docs.google.com/document/d/14kzaC8yl2QbJzMFEIkIJWviY78GW0Cnz7WF9GRh9Klg
    Dependency: IO Manager Plugin
    Created by Fedy Yapary on 2017-09-08
    Added Secure-LS plugin and improved by Nam on 2023-02-08
*/
ig.module('plugins.io.storage-manager')
    .requires('impact.game', 'plugins.io.io-manager', "plugins.secure-ls")
    .defines(function () {
        ig.secure = new SecureLS({
            encodingType: 'aes'
        });
        ig.Game.prototype.name = "MJS-Game";
        ig.Game.prototype.version = "1.0.0";
        ig.Game.prototype.sessionData = {};
        ig.Game.prototype.hash = function (s) {
            var hash = 0,
                i, chr;
            if (s.length === 0) return hash;
            for (i = 0; i < s.length; i++) {
                chr = s.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            var hexHash = hash.toString(36);
            return hexHash;
        };
        ig.Game.prototype.initData = function () {
            // Set Data to Store
            return this.sessionData = {
                sfx: 1,
                bgm: 1,
                level: 1,
                score: 0
            };
        };
        ig.Game.prototype.setupStorageManager = function () {
            if (typeof (this.name) === "undefined") {
                // console.error("Cannot found Game Name, Storage Manager Cancelled.");
            } else if (typeof (this.version) === "undefined") {
                // console.error("Cannot found Game Version, Storage Manager Cancelled.");
            } else {
                if (!this.io) {
                    this.io = new IoManager();
                    // console.log("IO Manager doesn't existed. Initialize...");
                }
                // console.log("Plug in Storage Manager");
                this.storage = this.io.storage;
                this.storageName = this.hash(this.name + "-v" + this.version).replace("-", "s");
                this.loadAll();
                // console.log(this.storageName)
            }
        };
        ig.Game.prototype.loadAll = function () {
            var dataString = ig.secure.get(this.storageName);
            if (dataString == "") {
                this.initData();
                this.saveAll();
            } else {
                this.sessionData = JSON.parse(dataString);
            }
        };
        ig.Game.prototype.saveAll = function () {
            ig.secure.set(this.storageName, JSON.stringify(this.sessionData));
        };
        ig.Game.prototype.load = function (key) {
            return this.sessionData[key];
        };
        ig.Game.prototype.save = function (key, value) {
            this.sessionData[key] = value
            this.saveAll();
        };
    });