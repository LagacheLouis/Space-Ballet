const PLANET_COLORS = ["#b9b9b9", "#ffa31a", "#00ace6", "#fe3d1b", "#d6b78f", "#ffc266", "#cce6ff", "#0073e6"];
const c_PLANET_SIZE = 30;
const c_PLANET_BOUNCE = 150;
const c_PLANET_MINSIZE = 1;
const c_LIGHTRANGE = 400;

const c_ORBIT_SIZE = 500;
const c_ORBIT_BOUNCE = 300;

const c_SUN_SIZE = 100;
const SUN_COLOR = "#ffff9f";
const c_AURA_SIZE = 200;

window.onload = function () {
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    window.onresize = function(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        WIDTH = canvas.width;
        HEIGHT = canvas.height;
    }

    var PLANET_SIZE = c_PLANET_SIZE;
    var PLANET_BOUNCE = c_PLANET_BOUNCE;
    var PLANET_MINSIZE = c_PLANET_MINSIZE;
    var ORBIT_SIZE = c_ORBIT_SIZE;
    var ORBIT_BOUNCE = c_ORBIT_BOUNCE;
    var SUN_SIZE = c_SUN_SIZE;
    var AURA_SIZE = c_AURA_SIZE;
    var LIGHTRANGE = c_LIGHTRANGE;

    var controls = {
        zoom: window.innerWidth/1920, yaxis: 0.3
    }
    setSizes();

    canvas.onwheel = function(e){
        if(e.deltaY < 0){
            controls.zoom -= 0.1;
        }else{
            controls.zoom += 0.1;
        }

        if(controls.zoom > 3 * canvas.width/screen.width){
            controls.zoom = 3 * canvas.width/screen.width;
        }else if(controls.zoom < 0.001){
            controls.zoom = 0.001;
        }

        setSizes(); 
    }

    function setSizes(){
        PLANET_SIZE = c_PLANET_SIZE * controls.zoom;
        PLANET_BOUNCE = c_PLANET_BOUNCE * controls.zoom;
        PLANET_MINSIZE = c_PLANET_MINSIZE * controls.zoom;
        ORBIT_SIZE = c_ORBIT_SIZE * controls.zoom;
        ORBIT_BOUNCE = c_ORBIT_BOUNCE * controls.zoom;
        SUN_SIZE = c_SUN_SIZE * controls.zoom;
        AURA_SIZE = c_AURA_SIZE * controls.zoom;
        LIGHTRANGE = c_LIGHTRANGE * controls.zoom;
    }

    let oldyaxis
    let drag_start = {x:-1,y:-1};
    canvas.onmousedown = function(e){
        drag_start.x = e.clientX;
        drag_start.y = e.clientY;
        oldyaxis = controls.yaxis;
    }

    let drag = {x:0,y:0};
    window.onmousemove = function(e){
        if(drag_start.x != -1 && drag_start.y != -1){
            drag.x = drag_start.x - e.clientX;
            drag.y = drag_start.y - e.clientY;
            controls.yaxis = oldyaxis + drag.y/canvas.height * 3;
            if(controls.yaxis < -1)
                controls.yaxis = -1;
            else if(controls.yaxis > 1)
                controls.yaxis = 1;
        }    
    }

    window.onmouseup = function(e){
        drag = {x:0,y:0};
        drag_start = {x:-1,y:-1};
    }


    var file = document.getElementById("thefile");
    var audio = document.getElementById("audio");

    let simplex = new SimplexNoise();

    document.querySelector("#icon").onclick = function(){
        document.querySelector("#inputs--wrapper").classList.toggle('active');
    }

    audio.src = "Noisestorm - Breakout.mp3";
    let needPlay = true;

    let musicName = document.getElementById("music-name");
    musicName.innerText = "Now Playing : " + "Noisestorm - Breakout";

    draw();
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        var context = new AudioContext();
        var src = context.createMediaElementSource(audio);
        var analyser = context.createAnalyser();

        src.connect(analyser);
        analyser.connect(context.destination);

        analyser.fftSize = 2048;

        var bufferLength = analyser.frequencyBinCount;
        console.log(bufferLength);

        var dataArray = new Uint8Array(bufferLength);

        document.querySelector('#play').onclick = function(){
            if(needPlay){
                TweenMax.to("#play",0.1,{opacity: 0, pointerEvents: "none"});
                TweenMax.fromTo(controls,2,{zoom: 0.0001, yaxis: 1},{zoom: 1920/window.innerWidth * 0.9, yaxis: 0.3, delay: 1,onUpdate : setSizes, onComplete:function(){
                    context.resume();
                    audio.load();
                    audio.play();
                }});
                needPlay = false;
            }
        };
        
        file.onchange = function(){
            let files = this.files;
            audio.src = files ? URL.createObjectURL(files[0]) : "Noisestorm - Breakout.mp3";
            document.querySelector("#inputs--wrapper").classList.remove('active');
            needPlay = true;
            TweenMax.to("#play",0.1,{opacity: 1, pointerEvents:"all"});
            musicName.innerText = "Now Playing : " + files[0].name;
        };

        
        ///////////////////////////////////////// PLANETS //////////////////////////////////////
        class Planet {
            constructor(angle, color) {
                this.sizeGround = PLANET_SIZE;
                this.sizeAtmosphere = PLANET_SIZE;

                this.angle = angle;
                this.orbit = ORBIT_SIZE;
                this.color = color;
                this.speedRatio = 0;            
            }

            update(kick) {

                this.angle += 10 * Math.PI / 180 * deltaTime;
                if (this.angle > Math.PI * 2)
                    this.angle = 0;

                this.orbit += (ORBIT_SIZE + ORBIT_BOUNCE * kick - this.orbit) * 0.6;

                let orthoSize = PLANET_SIZE + PLANET_BOUNCE * kick;
                let size = PLANET_MINSIZE + orthoSize * this.getDepth() * (1 - Math.abs(controls.yaxis)) + orthoSize * Math.abs(controls.yaxis);
            

                this.posX = Math.cos(this.angle + Math.PI / 2) * this.orbit + WIDTH / 2;
                this.posY = Math.sin(this.angle + Math.PI / 2) * this.orbit * controls.yaxis + HEIGHT / 2;

                this.sizeGround += (size - this.sizeGround) * 0.6;
                this.sizeAtmosphere += (size * 1.5 - this.sizeAtmosphere) * 0.1;
                this.drawGround();
                this.drawAtmosphere();
            }

            drawGround() {
                ctx.save();
                ctx.translate(this.posX, this.posY);
                ctx.beginPath();
                ctx.arc(0, 0, this.sizeGround, 0, 2 * Math.PI);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();
            }

            drawAtmosphere() {
                ctx.save();
                ctx.translate(this.posX, this.posY);
                ctx.beginPath();
                ctx.arc(0, 0, this.sizeAtmosphere, 0, 2 * Math.PI);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }

            getDepth() {
                return Math.abs(Math.PI - this.angle) / Math.PI;
            }
        }

        function sortPlanets(a, b) {
            if (a.getDepth() < b.getDepth())
                return -1;
            else if (a.getDepth() > b.getDepth())
                return 1;
            else
                return 0;
        };

        //////////////////////////////// SUN ///////////////////////////////////

        class Sun {
            constructor() {
                this.temp = 1000;
            }

            update() {
                this.posX = WIDTH / 2;
                this.posY = HEIGHT / 2;

                this.temp += (1000 + 10000 * getMoy(0,50) - this.temp) * 1;
                this.lightcolor = colorTemperatureToRGB(this.temp);
                this.coreColor = colorTemperatureToRGB(this.temp + 300);
                
                sun.drawLight();
                sun.drawAura();
                sun.drawCore();
            }

            drawCore() {
                ctx.save();
                ctx.translate(this.posX, this.posY);
                ctx.beginPath();
                ctx.arc(0, 0, SUN_SIZE, 0, 2 * Math.PI);
                ctx.fillStyle = this.coreColor;
                ctx.fill();
                ctx.restore();
            }

            drawAura() {
                let j = 0;
                let x0 = 0;
                let y0 = 0;
                ctx.save();
                ctx.translate(this.posX, this.posY);
                ctx.beginPath();

                for (let i = 0; i < 100; i++) {
                    let moy = getMoy(j, j + 1);
                    j++;
                    if (j > 25) {
                        j = 0;
                    }

                    let angle = i / 100 * Math.PI * 2;
                    let x = Math.cos(angle) * (moy * AURA_SIZE + SUN_SIZE - 2);
                    let y = Math.sin(angle) * (moy * AURA_SIZE + SUN_SIZE - 2);

                    if (i == 0) {
                        x0 = x;
                        y0 = y;
                    }

                    ctx.lineTo(x, y);
                }

                ctx.lineTo(x0, y0);

                ctx.lineWidth = 1;
                ctx.globalAlpha = 1;
                ctx.strokeStyle = this.coreColor;
                ctx.stroke();
                ctx.restore();
            }

            drawLight(){     
                let grad = ctx.createRadialGradient(0,0,0,0,0,LIGHTRANGE);
                grad.addColorStop(SUN_SIZE/LIGHTRANGE,"white");
                grad.addColorStop(SUN_SIZE/LIGHTRANGE + 0.2,this.lightcolor);
                grad.addColorStop(1,"rgba(0,0,0,0)");
                ctx.save();
                ctx.translate(this.posX, this.posY);
                ctx.beginPath();
                ctx.arc(0, 0, LIGHTRANGE, 0, 2 * Math.PI);
                ctx.fillStyle = grad;
                ctx.globalAlpha = 0.5;
                ctx.fill();
                ctx.restore();
                ctx.globalAlpha = 1;
            }
        }

        ///////////////////////////////////////// Stars //////////////////////////////////////
        class Star {
            constructor() {
                this.posX = Math.random() * WIDTH;
                this.posY = Math.random() * HEIGHT;
                this.noiseX = Math.random() * 100;
                this.noiseY = Math.random() * 100;
                this.brightness = Math.random();
            }

            update(kick) {

                if (this.posX < 0) {
                    this.posX = canvas.width;
                }
                if (this.posX > canvas.width) {
                    this.posX = 0;
                }

                if (this.posY < 0) {
                    this.posY = canvas.height;
                }
                if (this.posY > canvas.height) {
                    this.posY = 0;
                }


                let dirX = simplex.noise2D(0, this.noiseX / 5) * 250 * kick;
                let dirY = simplex.noise2D(0, this.noiseY / 5) * 250 * kick;

                this.noiseX += deltaTime;
                this.noiseY += deltaTime;
                this.posX += dirX * deltaTime;
                this.posY += dirY * deltaTime;

                this.globalY = this.posY - controls.yaxis * canvas.height * 2;
                while(this.globalY > canvas.height)
                    this.globalY -= canvas.height;
                while(this.globalY < 0)
                    this.globalY += canvas.height;

                this.draw();
            }

            draw() {
                ctx.save();
                ctx.translate(this.posX, this.globalY);
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, 2 * Math.PI);
                ctx.fillStyle = "white";
                ctx.globalAlpha = this.brightness;
                ctx.fill();
                ctx.restore();
                ctx.globalAlpha = 1;
            }
        }

        ///////////////////////////////////////// Constellations //////////////////////////////////////
        class Constellation {
            constructor() {
                this.posX = Math.random() * WIDTH;
                this.posY = Math.random() * HEIGHT;
                this.brightness = 1
                
                this.nodes = new Array();
                for (let i = 0; i < 5; i++) {
                    let angle = Math.random() * Math.PI * 2;
                    let x = Math.cos(angle) * Math.random() * 300 + this.posX;
                    let y = Math.sin(angle) * Math.random() * 300 + this.posY + controls.yaxis * HEIGHT;
                    this.nodes.push(new ConstellationNode(x,y));
                }

            }

            update() {
                this.brightness -= deltaTime;
                if(this.brightness < 0)
                    this.brightness = 0;
                for(let i = 0;i<this.nodes.length;i++){
                    this.nodes[i].link(this.nodes,this.brightness);
                    this.nodes[i].draw(this.brightness);
                }
            }
        }
        
        class ConstellationNode{
            constructor(x,y) {
                this.posX = x;
                this.posY = y;
            }

            draw(brightness){
                ctx.save();
                ctx.translate(this.posX, this.posY);
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, 2 * Math.PI);
                ctx.fillStyle = "white";
                ctx.globalAlpha = brightness;
                ctx.fill();
                ctx.restore();
            }

            link(nodes,brightness){ 
                nodes.forEach((e)=>{
                    let distance = Math.sqrt(Math.pow(e.posX - this.posX,2) + Math.pow(e.posY - this.posY,2));   
                    if(distance < 300){
                        ctx.beginPath();
                        ctx.moveTo(e.posX,e.posY - controls.yaxis * HEIGHT);
                        ctx.lineTo(this.posX,this.posY - controls.yaxis * HEIGHT);
                        ctx.strokeStyle = "white";
                        ctx.globalAlpha = (1 - distance/300) * brightness;
                        ctx.stroke();
                    }
                });
            }
        }



        ///////////////////////////////////////////// INITIALISATION //////////////////////////////////////////

        let stars = new Array();
        for (let i = 0; i < 300; i++) {
            stars.push(new Star());
        }
        let constellations = new Array();

        let planets = new Array();
        for (let i = 0; i < PLANET_COLORS.length; i++) {
            let angle = i / PLANET_COLORS.length * Math.PI * 2;
            let color = PLANET_COLORS[i];
            planets.push(new Planet(angle, color));
        }

        let sun = new Sun();

        ///////////////////////////////////////////// UPDATE ///////////////////////////////////////////////////
        let deltaTime = 0;
        let lastCalledTime = Date.now();
        function update() {
            analyser.getByteFrequencyData(dataArray);

            //console.log(dataArray);
            deltaTime = (Date.now() - lastCalledTime) / 1000;
            lastCalledTime = Date.now();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let kick = getKick(50, 100);

            beat = clamp(beat - (deltaTime * 0.5),0,100);
            if(getBeat(0,50)){
                if(Math.random() > 0.75)
                    constellations.push(new Constellation());
            }

            stars.forEach((e) => {
                e.update(kick);
            });

            let index = 0
            constellations.forEach((e) => {     
                e.update();    
                if(e.brightness == 0){     
                    constellations.splice( index, 1 );
                }
                index++;
            });

            planets.sort(sortPlanets);
            planets.forEach((e) => {
                e.update(kick);
                if (e.getDepth() < 0.5) {
                    sun.update();
                }
            });

            requestAnimationFrame(update);
        }

        ////////////////////////////// UTILITY FUNCTION /////////////////////////////////////

        function extractData(min, max) {
            return dataArray.slice(min / 100 * bufferLength, this.length + 1 - ((max / 100 * bufferLength) * -1));
        }

        function getMoy(min, max) {
            let array = extractData(min, max);
            return Array_Average(array) / 255;
        }

        function getMax(min, max) {
            let array = extractData(min, max);
            return Math.max(...array) / 255;
        }

        function getKick(min, max) {
            let array = extractData(min, max);
            return Quartile(array, 0.75) / 255 + Quartile(array, 0.25) / 255;
        }

        let beat = 0;
        function getBeat(min,max){
            let val = getKick(min,max);
            if(val > beat && val > 0.5){
                beat = val;
                return true;
            }
            return false;
        }


        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        function Quartile(data, q) {
            data = Array_Sort_Numbers(data);
            var pos = ((data.length) - 1) * q;
            var base = Math.floor(pos);
            var rest = pos - base;
            if ((data[base + 1] !== undefined)) {
                return data[base] + rest * (data[base + 1] - data[base]);
            } else {
                return data[base];
            }
        }

        function Array_Sort_Numbers(inputarray) {
            return inputarray.sort(function (a, b) {
                return a - b;
            });
        }

        function Array_Sum(t) {
            return t.reduce(function (a, b) { return a + b; }, 0);
        }

        function Array_Average(data) {
            return Array_Sum(data) / data.length;
        }
        update();
    };

        
    function colorTemperatureToRGB(kelvin){

        var temp = kelvin / 100;

        var red, green, blue;

        if( temp <= 66 ){ 

            red = 255; 
            
            green = temp;
            green = 99.4708025861 * Math.log(green) - 161.1195681661;

            
            if( temp <= 19){

                blue = 0;

            } else {

                blue = temp-10;
                blue = 138.5177312231 * Math.log(blue) - 305.0447927307;

            }

        } else {

            red = temp - 60;
            red = 329.698727446 * Math.pow(red, -0.1332047592);
            
            green = temp - 60;
            green = 288.1221695283 * Math.pow(green, -0.0755148492 );

            blue = 255;

        }

        return "rgb("+clamp(red,   0, 255)+","+clamp(green, 0, 255)+","+clamp(blue,  0, 255)+")";

    }


    function clamp( x, min, max ) {

        if(x<min){ return min; }
        if(x>max){ return max; }

        return x;

    }


};

