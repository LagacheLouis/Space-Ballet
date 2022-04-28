const { default: gsap } = require("gsap");
const { DEFAULT_FILE } = require("./constants");
const { default: AudioAnalyser } = require("./utils/audioAnalyser");
const { default: Clock } = require("./utils/clock");
const { clamp } = require("./utils/helpers");

export default class App{
    constructor(){
        const canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext("2d");
        this.clock = new Clock();
        this.audio = document.getElementById("audio");
        this.analyser = new AudioAnalyser({audioElement: this.audio, fftSize: 2048, beatsCount: 3});

        this.controls = {
            zoom: window.innerWidth/1920, 
            yaxis: 0.3
        };

        this.scrollEvents();
        this.dragEvents();
        this.playerEvents();

        window.onresize = () => this.resize();
        this.resize();

        this.setAudioSource(DEFAULT_FILE, DEFAULT_FILE);
        this.update = () => {};
        this.loop();
    }

    resize(){
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }

    scrollEvents(){
        window.onwheel = (e) => {
            if(e.deltaY < 0){
                this.controls.zoom -= 0.1;
            }else{
                this.controls.zoom += 0.1;
            }
            this.controls.zoom = clamp(this.controls.zoom, 0.001, 3);
        }
    }

    dragEvents(){
        let startY;
        let drag_start = {x:-1,y:-1};
        window.onmousedown = (e) => {
            drag_start.x = e.clientX;
            drag_start.y = e.clientY;
            startY = this.controls.yaxis;
        }

        let drag = {x:0,y:0};
        window.onmousemove = (e) => {
            if(drag_start.x != -1 && drag_start.y != -1){
                drag.x = drag_start.x - e.clientX;
                drag.y = drag_start.y - e.clientY;
                this.controls.yaxis = startY + drag.y / window.innerHeight * 3;
                if(this.controls.yaxis < -1)
                    this.controls.yaxis = -1;
                else if(this.controls.yaxis > 1)
                    this.controls.yaxis = 1;
            }    
        }

        window.onmouseup = (e) =>{
            drag = {x:0,y:0};
            drag_start = {x:-1,y:-1};
        }
    }

    playerEvents(){
        const input = document.getElementById("thefile");

        input.onchange = (e) => {
            const files = e.target.files;
            document.querySelector("#inputs--wrapper").classList.remove('active');
            this.setAudioSource(files ? URL.createObjectURL(files[0]) : DEFAULT_FILE, files[0].name);
            this.analyser.updateMedia({audioElement: this.audio});
        };
        document.querySelector("#icon").onclick = function(){
            document.querySelector("#inputs--wrapper").classList.toggle('active');
        }
        document.querySelector('#play').onclick = () => {
            gsap.to("#play",{duration : 0.1, opacity: 0, pointerEvents: "none"});
            gsap.fromTo(this.controls,{zoom: 0.0001, yaxis: 1},{duration: 2, zoom: window.innerWidth/1920 , yaxis: 0.3, delay: 1, onComplete: ()=> {
                this.analyser.context.resume();
                this.audio.load();
                this.audio.play();
            }});
        };

        document.querySelector("#stream").onclick = () => {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then((stream) => {
                    this.analyser.updateMedia({stream});
                    this.audio.pause();
                });
        }
        document.querySelector("#demo").onclick = () => {
            this.setAudioSource(DEFAULT_FILE, DEFAULT_FILE);
        }
    }

    setAudioSource(file, name){
        gsap.to("#play",{duration: 0.1, opacity: 1, pointerEvents:"all"});
        const nameElement = document.getElementById("music-name");
        this.audio.src = file;
        nameElement.innerText = `Now Playing : ${name}`;
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