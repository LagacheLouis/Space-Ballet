import App from "./core/app";
import { PLANET_COLORS } from "./constants";
import Constellation from "./entities/constellation";
import Planet, { sortPlanets } from "./entities/planet";
import Star from "./entities/star";
import Sun from "./entities/sun";
import SimplexNoise from "./utils/simplexNoise";
import AudioAnalyser from "./audio/audioAnalyser";
import AudioPlayer from "./audio/audioPlayer";
import { DEFAULT_FILE } from "./constants";
import gsap from "gsap";


window.onload = () => {
    //Create APP
    const canvas = document.getElementById("canvas");
    const analyser = new AudioAnalyser({ fftSize: 2048, beatsCount: 10});
    const audioplayer = new AudioPlayer({ 
            analyser: analyser, 
            demoBtn: "#demo", 
            fileBtn: "#file", 
            streamBtn: "#stream", 
            microBtn: "#micro",
            demofile: DEFAULT_FILE
    });
    const app = new App({canvas, audioplayer, analyser});
    global.app = app;

    //Create visuals
    const sun = new Sun();
    const planets = new Array();
    for (let i = 0; i < PLANET_COLORS.length; i++) {
        let angle = i / PLANET_COLORS.length * Math.PI * 2;
        let color = PLANET_COLORS[i];
        planets.push(new Planet(angle, color));
    }
    const stars = new Array();
    const n = new SimplexNoise();
    for (let i = 0; i < 300; i++) {
        stars.push(new Star(n));
    }
    const constellations = new Array();

    //Update
    app.update = () =>{
        const avg = app.analyser.getAverage({min: 0, max: 50});
        const kick = app.analyser.getQuartile({min: 25, max: 100},0.75) + app.analyser.getQuartile({min: 25, max: 100},0.25);
        const beat = app.analyser.onBeats();

        stars.forEach(s => s.update(kick));

        if(beat){
            constellations.push(new Constellation());
        }

        constellations.forEach((c, index) => {     
            c.update();    
            if(c.brightness <= 0) constellations.splice( index, 1 );  
            index++;
        });

        planets.sort(sortPlanets);
        planets.forEach((p) => {
            p.update(kick);
            if (p.getDepth() < 0.5) sun.update(avg);
        });

        
    }

    document.getElementById("song-selector-toggle").onclick = () => togglePanel();
    audioplayer.onAudioChange(()=>{
        console.log("test");
        togglePanel();
        revealAnimation();
        setAudioName(audioplayer.audioName);
    });
    
    app.analyser.debugger.on = false;
}


function revealAnimation(){
    gsap.fromTo(global.app.controls,{zoom: 0.0001, yaxis: 1},{duration: 2, zoom: window.innerWidth/1920 , yaxis: 0.3, delay: 1});
}

function setAudioName(name){
    const nameElement = document.getElementById("music-name");
    gsap.set(nameElement, {autoAlpha: 0});
    nameElement.innerHTML = "";
    const text = `Now Playing : ${name} `;
    for (var i = 0; i < text.length; i++) {
        nameElement.innerHTML += `<span>${text.charAt(i)}</span>`;
    }
    setTimeout(()=>{
        gsap.to(nameElement, {autoAlpha: 1, duration: 1});
        const tl = gsap.timeline();
        const duration = .5;
        const stagger = duration * 0.2;
        tl.fromTo("#music-name span", { y: 0, opacity: 0.5}, {duration, y: -3, opacity: .7, stagger}, 0)
        tl.to("#music-name span", {duration, y: 0, opacity: 0.5, stagger}, duration)
        tl.repeat(-1);
    },0)
}

function togglePanel(){
    document.getElementById("song-selector").classList.toggle('active');
}