import AudioPlayer from "../audio/audioPlayer";
import Controls from "./controls";
const { default: Clock } = require("../utils/clock");


export default class App{
    constructor(){
        const canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext("2d");
        this.clock = new Clock();
        this.audioplayer = new AudioPlayer();
        this.analyser = this.audioplayer.analyser;
 

        this.controls = new Controls();

        window.onresize = () => this.resize();
        this.resize();


        this.update = () => {};
        this.loop();
    }

    resize(){
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }

    loop(){
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.clock.update();

        this.analyser.refreshData(this.clock.time);
        this.analyser.debug();

        this.update();
        requestAnimationFrame(()=> this.loop())
    }

    
}