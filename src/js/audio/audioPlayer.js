export default class AudioPlayer{
    constructor({analyser, demoBtn, fileBtn, streamBtn, microBtn, demofile}){
        this.audioElement = document.getElementById("audio");
        this.analyser = analyser;
        this.stream = false;
        this.onFileChangeCallbacks = [];
        this.audioName = "";
        this.demofile = demofile;
        this._demoButton(demoBtn);
        this._fileButton(fileBtn);
        this._streamButton(streamBtn);
        this._microButton(microBtn);
    }

    _demoButton(query){
        const el = this._getOrCreateElement(query, 'button');
        if(!el) return;
        el.onclick = () => {
            this.setAudioElement(this.demofile);
            this.audioName = this.demofile;
            this._callAudioChange();
        }
    }

    _fileButton(query){
        const el = this._getOrCreateElement(query, 'button');
        if(!el) return;
        const input = document.getElementById("input");
        el.onclick = () => input.click();
        input.onchange = (e) => {
            const files = e.target.files;
            if(!files) return;
            this.setAudioElement(URL.createObjectURL(files[0]));
            this.audioName = files[0].name;
            this._callAudioChange();
        };
    }

    _streamButton(query){
        const el = this._getOrCreateElement(query, 'button');
        if(!el) return;
        el.onclick = () => {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            .then((stream) => {
                this.audioElement.pause();
                this.setStream(stream);
                this.audioName = "System Audio";
                this._callAudioChange();
            });
        };
    }

    _microButton(query){
        const el = this._getOrCreateElement(query, 'button');
        if(!el) return;
        el.onclick = () => {
            navigator.mediaDevices.getUserMedia({audio: true })
            .then((stream) => {
                this.audioElement.pause();
                this.setStream(stream);
                this.audioName = "Microphone";
                this._callAudioChange();
            });
        };
    }

    _closeStream(){
        if(!this.stream) return;
        this.stream.getTracks().forEach(function(track) {
            track.stop();
        });
        this.stream = false;
    }

    _getOrCreateElement(query, type){
        if(typeof(query) == "string")
            return document.querySelector(query);
        if(typeof(query) == "object")
            return query;
        return false;
    }

    _callAudioChange(){
        this.onFileChangeCallbacks.forEach(fn => fn());
    }

    setAudioElement(file){
        this._closeStream();
        this.audioElement.src = file;
        this.audioElement.load();
        this.audioElement.oncanplaythrough = () =>{
            const stream = this.audioElement.captureStream(60);
            this.setStream(stream);
            this.audioElement.play();
        }
    }

    setStream(stream){
        this._closeStream();
        this.stream = stream;
        this.analyser.setStream(stream);
        this.analyser.context.resume();
    }

    onAudioChange(fn){
        this.onFileChangeCallbacks.push(fn);
    }
}