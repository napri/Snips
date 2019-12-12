'use strict'

var omx =  require('omx-interface');
var Finder = require('./finder.js');
const Menu = require('./menu.js');
var homedir = require('os').homedir();

const VOLUME_INITIAL = .5,
      VOLUME_REDUCED = 0.05,
      VOLUME_INCREMENT = 0.2,
      VOLUME_DECREMENT = 0.25,
      VOLUME_SMALL_DECREMENT = 0.15;

function Player(client){
        this.client = client;
    this.options = {
        AudioOutput : 'alsa',
        blackBackground:true,
        disableKeys:true,
        disableOnScreenDisplay:true
    };
    this.menu = new Menu(homedir);
    this.finder = new Finder(client, homedir);
    this.videos = this.finder.getTitles();
    this.videoIndex = 0;
    this.volume = VOLUME_INITIAL;
    this.playing = false;
    this.paused = false;
    this.muted = false;
    this.actualVolume = omx.getCurrentVolume;
    this.methods = {

    'Princesse1999:Listmusik': this.titelSchirm.bind(this),
    'Princesse1999:Titelspielen': this.tilelFinden.bind(this),
    'Princesse1999:Arstistspielen': this.tilelFinden.bind(this),
    'Princesse1999:Musicbeenden': this.pause.bind(this),
    'Princesse1999:Resumemusik': this.spielen.bind(this),
    'Princesse1999:Volumeup': this.volumHoch.bind(this),
    'Princesse1999:Volumedown': this.volumeRunter.bind(this),
    'Princesse1999:Naechstemusik': this.naechsteMusik.bind(this),
    'Princesse1999:Vorherigemusik': this.vorherigeMusik.bind(this),
    'Princesse1999:Stummschalten': this.stummSchalten.bind(this),
    'quit': omx.quit

    };

}


Player.prototype.start = function() {
    this.menu.writeTitles(this.videos)
      .then(() => {
        this.titelSchirm();
        console.log('start');
        this.menu.removeLoading();
      });
};


Player.prototype.titelSchirm = function () {
  console.log('Titelschirm');
    if (this.playing) {
      omx.quit();
      this.playing = false;
      this.paused = false;
      this.muted = false;
    }
    this.menu.removeMenu();
    this.menu.showMenu();
    this.videoIndex = 0;
  };


Player.prototype.tilelFinden = function (payload) {
    let value,
        video;
  
    try {
      value = payload.slots[0].value.value.toLowerCase();
    } catch (e) {
      console.log('error with the song name');
      return ;
    }
    video = this.videos
            .find((item) => item.artist == value || item.title == value);
    if (!video)
      return ;
    this.videoIndex = video.index;
    this.titelSpielen();
  };

Player.prototype.titelSpielen = function () {
  console.log('Titelspielen');
    if (this.playing)
      omx.quit();
    console.log('spielen ' + this.videos[this.videoIndex].path);
    omx.open(this.videos[this.videoIndex].path, this.options);
    omx.onProgress(function(track){ //subscribe for track updates (every second while not paused for now)
      console.log(track.position);
      console.log(track.duration);
  });
    omx.setVolume(this.volume);
    this.muted = false;
    this.playing = true;
    this.paused = false;
  };

  Player.prototype.pause = function () {
    if ((this.playing && !this.paused))
    {
        omx.pause();
        this.paused = true;
    }
     return ; 
  };

  Player.prototype.spielen = function () {
    console.log('spielen');
    if (!this.playing && this.paused)
    {
        omx.play();
        this.paused = false;
    }
    return ;
  };

  Player.prototype.naechsteMusik = function () {
    console.log('naechsteMusik');
    if (!this.playing)
      return ;
    if (this.videoIndex + 1 >= this.videos.length) {
      this.titelSchirm();
      return ;
    }
    this.videoIndex++;
    this.titelSpielen();
  };

  Player.prototype.vorherigeMusik = function () {
    console.log('vorherigeMusik');
    if (!this.playing)
      return ;
    if (this.videoIndex == 0) {
      omx.setPosition(0);
      return ;
    }
    this.videoIndex--;
    this.titelSpielen();
  };


Player.prototype.volumeRunter = function () {
  console.log('volumeRunter');
    console.log('volume down');
    if (!this.playing) {
      return ;
    } else if (this.muted) {
      this.stummSchalten();
      return ;
    }
    if (this.volume <= VOLUME_REDUCED)
      this.volume = 0;
    else if (this.volume <= .25)
      this.volume = Math.round((this.volume - VOLUME_SMALL_DECREMENT) * 100)
                    / 100;
    else
      this.volume = Math.round((this.volume - VOLUME_DECREMENT) * 100)
                    / 100;
    this.volume = this.volume < 0 ? 0 : this.volume;
    omx.setVolume(this.volume);
  };

  Player.prototype.volumHoch = function () {
    console.log('volume up');
    if (!this.playing) {
      return ;
    } else if (this.muted) {
      this.stummSchalten();
      return ;
    }
    if (this.volume >= 0.95)
      this.volume = 1 ;
    else
      this.volume = Math.round((this.volume + VOLUME_INCREMENT) * 100) / 100;
    omx.setVolume(this.volume);
  };
  
  Player.prototype.stummSchalten = function () {
    if (!this.playing)
      return ;
    console.log('toggling mute');
    if (!this.muted) {
      omx.setVolume(0);
      this.muted = true;
    } else {
      omx.setVolume(this.volume);
      this.muted = false;
    }
  };

  Player.prototype.listenOn = function () {
    console.log('temporary decreasing volume to hear query');
    if (!(this.playing && !this.muted))
      return ;
    else if (this.volume > VOLUME_REDUCED) {
      omx.setVolume(VOLUME_REDUCED);
    }
  };

  Player.prototype.listenOff = function () {
    if (this.actualVolume() == VOLUME_REDUCED && !this.muted) {
      omx.setVolume(this.volume);
      console.log('normal volume back');
    }
    console.log('end of action');
  };

  Player.prototype.logInfo = function () {
    console.log('--------');
    console.log(`playing: ${this.playing}`);
    console.log(`paused: ${this.paused}`);
    console.log(`player.volume: ${this.volume}`);
    console.log(`omx actual volume: ${this.actualVolume()}`);
    console.log(`muted: ${this.muted}`);
    console.log('--------');
  };
  
  module.exports = Player;