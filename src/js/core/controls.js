const { clamp } = require("../utils/helpers");
export default class Controls{

    constructor(){
        this.zoom = window.innerWidth/1920;
        this.yaxis = 0.3;
        this.scrollEvents();
        this.dragEvents();
    }

    scrollEvents(){
        window.onwheel = (e) => {
            if(e.deltaY < 0){
                this.zoom -= 0.1;
            }else{
                this.zoom += 0.1;
            }
            this.zoom = clamp(this.zoom, 0.001, 3);
        }
    }

    dragEvents(){
        let startY;
        let drag_start = {x:-1,y:-1};
        window.onmousedown = (e) => {
            drag_start.x = e.clientX;
            drag_start.y = e.clientY;
            startY = this.yaxis;
        }

        let drag = {x:0,y:0};
        window.onmousemove = (e) => {
            if(drag_start.x != -1 && drag_start.y != -1){
                drag.x = drag_start.x - e.clientX;
                drag.y = drag_start.y - e.clientY;
                this.yaxis = startY + drag.y / window.innerHeight * 3;
                if(this.yaxis < -1)
                    this.yaxis = -1;
                else if(this.yaxis > 1)
                    this.yaxis = 1;
            }    
        }

        window.onmouseup = (e) =>{
            drag = {x:0,y:0};
            drag_start = {x:-1,y:-1};
        }
    }
}