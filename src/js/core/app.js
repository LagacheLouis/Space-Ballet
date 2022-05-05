import Controls from "./controls";
import Clock from "../utils/Clock";


export default class App{
    constructor({canvas, audioplayer, analyser}){
        this.ctx = canvas.getContext("2d");
        this.clock = new Clock();
        this.audioplayer = audioplayer;
        this.analyser = analyser;

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

    onAudioChange(){
        this.revealAnimation();
        this.setAudioName();
    }

   
}