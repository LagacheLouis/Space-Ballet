import { DEFAULT_FILE } from "../constants";
const { default: AudioAnalyser } = require("./audioAnalyser");
const { default: gsap } = require("gsap");

export default class AudioPlayer{
    constructor(){
        this.audioElement = document.getElementById("audio");
        this.analyser = new AudioAnalyser({audioElement: this.audioElement, fftSize: 2048, beatsCount: 10});

        document.getElementById("song-selector-toggle").onclick = () => this.togglePanel();
        this.defaultEvents();
        this.fileEvents();
        this.streamEvents();
    }

    defaultEvents(){
        document.getElementById("demo").onclick = () => {
            this.setAudioSource(DEFAULT_FILE, DEFAULT_FILE);
        }
    }

    fileEvents(){
        const input = document.getElementById("input");
        document.getElementById("file").onclick = () => input.click();
        input.onchange = (e) => {
            const files = e.target.files;
            this.setAudioSource(files ? URL.createObjectURL(files[0]) : DEFAULT_FILE, files[0].name);
            this.analyser.updateMedia({audioElement: this.audioElement});
        };
    }

    streamEvents(){
        document.getElementById("stream").onclick = () => {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            .then((stream) => {
                this.audioElement.pause();
                this.analyser.updateMedia({stream});
                this.animate();
                this.createName("Streaming system audio");
            });
        };
    }

    togglePanel(){
        document.getElementById("song-selector").classList.toggle('active');
    }

    setAudioSource(file, name){
        this.audioElement.src = file;
        this.analyser.context.resume();
        this.togglePanel();
        this.animate();
        this.createName(name);
        this.audioElement.load();
        this.audioElement.play();
    }

    animate(){
        gsap.fromTo(global.app.controls,{zoom: 0.0001, yaxis: 1},{duration: 2, zoom: window.innerWidth/1920 , yaxis: 0.3, delay: 1, onComplete: ()=> {
            this.analyser.context.resume();
        }});
    }

    createName(name){
        const nameElement = document.getElementById("music-name");
        nameElement.innerHTML = "";
        const text = `Now Playing : ${name} `;
        for (var i = 0; i < text.length; i++) {
            nameElement.innerHTML += `<span>${text.charAt(i)}</span>`;
        }
        setTimeout(()=>{
            const tl = gsap.timeline();
            const duration = .5;
            const stagger = duration * 0.2;
            tl.fromTo("#music-name span", { y: 0, opacity: 0.5}, {duration, y: -3, opacity: .7, stagger}, 0)
            tl.to("#music-name span", {duration, y: 0, opacity: 0.5, stagger}, duration)
            tl.repeat(-1);
        },100)
     
    }
}