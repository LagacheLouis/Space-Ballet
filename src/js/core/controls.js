import { clamp } from "../utils/helpers";
export default class Controls{

    constructor(){
        this.zoom = window.innerWidth/1920;
        this.yaxis = 0.3;
        this.startY = 0;
        this.drag_start = {x:-1,y:-1};
        this.drag =  {x:0,y:0};
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
        window.onmousedown = e => this.onDragStart(e);
        window.onmousemove = e => this.onDrag(e);
        window.onmouseup = e => this.onDragEnd(e);

        window.ontouchstart = e => this.onDragStart(e.touches[0]);
        window.ontouchmove = e => this.onDrag(e.touches[0]);
        window.ontouchend = e => this.onDragEnd(e.touches[0]);
    }

    onDragStart(e){
        console.log("test");
        this.drag_start.x = e.clientX;
        this.drag_start.y = e.clientY;
        this.startY = this.yaxis;
    }

    onDrag(e){
        if(this.drag_start.x != -1 && this.drag_start.y != -1){
            this.drag.x = this.drag_start.x - e.clientX;
            this.drag.y = this.drag_start.y - e.clientY;
            this.yaxis = this.startY + this.drag.y / window.innerHeight * 3;
            if(this.yaxis < -1)
                this.yaxis = -1;
            else if(this.yaxis > 1)
                this.yaxis = 1;
        }   
    }

    onDragEnd(e){
        this.drag = {x:0,y:0};
        this.drag_start = {x:-1,y:-1};
    }
}

function isTouchDevice() {
    return window.matchMedia("(pointer: coarse)").matches
  }