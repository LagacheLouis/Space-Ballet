import { scaledSizes } from "../constants";

export default class Constellation {
    constructor() {
        const { controls } = global.app;
        const {WIDTH, HEIGHT} = scaledSizes();
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
        const { clock } = global.app;
        this.brightness -= clock.delta;
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
        const {ctx} = global.app;
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
        const {ctx, controls} = global.app;
        const {HEIGHT} = scaledSizes();
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