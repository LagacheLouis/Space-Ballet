const { default: App } = require("./core/app");
const { PLANET_COLORS } = require("./constants");
const { default: Constellation } = require("./entities/constellation");
const { default: Planet, sortPlanets } = require("./entities/planet");
const { default: Star } = require("./entities/star");
const { default: Sun } = require("./entities/sun");
const { default: SimplexNoise } = require("./utils/simplexNoise");


window.onload = () => {
    const app = new App();
    global.app = app;

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
    
    app.analyser.debugger.on = false;
}
