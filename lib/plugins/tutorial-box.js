// Jason Low's Tutorial Box Class
// jason.low@impact360design.com
// v1.2

// Notes:
// v1.2 - added onStageComplete, onStageEnd, onTutorialBoxHidden callbacks
// v1.1 - added option to hide default black bg
// v1.1 - updated text wrapper

// Known Issues:
// - drawing is done by absolute positions, syncing has to be done manually by the programmer
// - entire tutorial box object is meant to be anchored to a center point
// - pausing can be achieved by not running the update() function
// - to resume, just continue calling the update() function

// Usage Examples:
/*
this.tutorialBox = new ig.TutorialBox();
this.tutorialBox.drawDefaultBgFlag = true;
this.tutorialBox.bgShowDuration = 0.5;
this.tutorialBox.bgHideDuration = 0.5;
this.tutorialBox.textShowDuration = 0.25;
this.tutorialBox.textHideDuration = 0.25;

this.tutorialBox.pos.x = ig.system.width/2;
this.tutorialBox.pos.y = ig.system.height/2;
this.tutorialBox.rect.w = ig.system.width*0.75;
this.tutorialBox.rect.h = ig.system.width*0.25;
this.tutorialBox.rect.x = -this.tutorialBox.rect.w/2;
this.tutorialBox.rect.y = -this.tutorialBox.rect.h/2;

this.tutorialBox.textPos.x = this.tutorialBox.rect.w/2;
this.tutorialBox.textPos.y = this.tutorialBox.rect.h/2;
this.tutorialBox.textRect.w = this.tutorialBox.rect.w*0.8;
this.tutorialBox.textRect.h = this.tutorialBox.rect.h*0.25;
this.tutorialBox.textRect.x = -this.tutorialBox.textRect.w/2;
this.tutorialBox.textRect.y = -this.tutorialBox.textRect.h/2;

this.tutorialBox.textNextPos.x = this.tutorialBox.rect.w - 7;
this.tutorialBox.textNextPos.y = this.tutorialBox.rect.h - 5;
this.tutorialBox.textNextFontSize = 18;
this.tutorialBox.textNextAlign = "right";
this.tutorialBox.textNext = "continue";

this.tutorialBox.textFont = 'Impact, Charcoal, sans-serif';
this.tutorialBox.setTextFontSize(20);
this.tutorialBox.rtlFlag = false;
this.tutorialBox.textHScrollRate = 50; //50 characters per second
this.tutorialBox.preserveWordsFlag = true;
this.tutorialBox.setMessages("page 1 contents");
this.tutorialBox.setMessages("page 2 contents");

this.tutorialBox.stages[0].continue = true;
this.tutorialBox.stages[1].continue = true;

this.tutorialBox.onStageComplete=function(stageNum){
    console.log("stage number: " + stageNum + " completed");
}.bind(this);

this.tutorialBox.onStageEnd=function(stageNum){
    console.log("stage number: " + stageNum + " has ended");
    if(stageNum == this.tutorialBox.stages.length-2){
        this.tutorialBox.textNext = "end";
    }
}.bind(this);

this.tutorialBox.onTutorialBoxHidden=function(){
    console.log("tutorial box hidden");
}.bind(this);

this.tutorialBox.show();
//this.tutorialBox.hide();
//this.tutorialBox.gotoNextStage();
//this.tutorialBox.gotoPrevStage();
//var curStage = this.tutorialBox.getCurStage();
//this.tutorialBox.setMessageInStage(1, "editted page 2 contents");
//this.clickAnywhereToContinueFlag = true;

draw: function(){
    this.tutorialBox.draw();
}
update: function(){
    this.tutorialBox.update();
}
*/

ig.module( "plugins.tutorial-box" )
.requires(
)
.defines(function(){

ig.TutorialBox = ig.Class.extend({

    // Render Vars
    pos: {x:0, y:0},
    rect: {x:0, y:0, w:0, h:0},
    alpha: 1,

    // Bg Box
    bgAlpha: 0,

    // Text
    wrappedMessage: [],
    curStageId: 0,
    stages: [],

    textPos: {x:0, y:0},
    textRect: {x:0, y:0, w:0, h:0},
    textAlpha: 1,
    textColor: {r:255, g:255, b:255},
    textFont: null,
    textFontSize: 24,
    textLineHeight: 24,
    textHeightAdjustment: 0,
    textHScrollRate: 50,
    textHScrollPos: 0,

    // Text Next
    textNext: "",
    textNextPos: {x:0, y:0},
    textNextAlpha: 0,
    textNextAlign: "center",
    textNextFontSize: 18,

    // Timers
    bgTime: 0,
    textTime: 0,
    textNextTime: 0,
    textHScrollTime: 0,

    bgShowDuration: 0.0,
    bgHideDuration: 0.0,
    textShowDuration: 0,
    textHideDuration: 0.5,

    // Flags
    drawDefaultBgFlag: false,
    preserveWordsFlag: true,
    clickAnywhereToContinueFlag: false,
    rtlFlag: false,
    textWrap: true,
    textShadowDisabled: true,
    disabled: false,
    hidden: false,

    bgStateId: 0,
    bgStates: {
        hidden:0,
        showing:1,
        shown:2,
        hiding:3,
    },

    textStateId: 0,
    textStates: {
        hidden:0,
        showing:1,
        shown:2,
        hiding:3,
    },

    // Name of bound inputs. see: ig.input.bind()
    clickStateName: "click",
    keyStateName: "", //enter

    // Callback
    onStageEnd: null,
    onTutorialBoxHidden: null,
    onStageComplete: null,

    init: function(){
        // default font
        this.textFont = "Impact, Charcoal, sans-serif";
        this.setTextFontSize(24);
    },

    setTextFontSize: function(val){
        if(!val) return;
        this.textFontSize = val;
        this.textLineHeight = val;
    },

    setMessages: function(val){
        if(!val) return;
        if(!val.length) return;

        if(typeof(val) == "string"){
            var arr = [];
            arr.push(val);
            val = arr;
        }

        if (val.constructor === Array){
            var accept = true;
            for(var i=0; i<val.length; i++){
                var item = val[i];
                if(typeof(item) != "string"){
                    accept = false;
                    break;
                }
            }
            if(!accept) return;

            for(var i=0; i<val.length; i++){
                var st = {};
                st.message = val[i];

                if(this.textWrap && this.textRect.w > 0){
                    st.wrappedMessage = this.wrapText(st.message, this.textRect.w, this.textFontSize, this.textFont, this.preserveWordsFlag);
                }
                st.continue = true;

                this.stages.push(st);
            }
        }
    },

    setMessageInStage: function(stageNum, val){
        if(!val) return;
        if(typeof(val) != "string") return;

        if(stageNum < 0 ||
           stageNum >= this.stages.length){
            return;
        }

        var st = {};
        st.message = val;

        if(this.textWrap && this.textRect.w > 0){
            st.wrappedMessage = this.wrapText(st.message, this.textRect.w, this.textFontSize, this.textFont, this.preserveWordsFlag);
        }
        st.continue = this.stages[stageNum].continue;

        this.stages[stageNum] = st;
    },

    draw: function(){
        if(this.bgStateId != this.bgStates.hidden){
            if(this.drawDefaultBgFlag){
                this.drawBgBox();
            }
        }

        if(this.textStateId != this.textStates.hidden){
            this.drawScrollText();
            this.drawNextText();
        }
    },

    update: function(){
        if(this.bgStateId == this.bgStates.showing){
            if(this.bgTime < this.bgShowDuration){
                var t = this.bgTime / this.bgShowDuration;
                this.bgAlpha = t;
                this.bgTime += ig.system.tick;
            }else{
                this.bgTime = 0;
                this.bgAlpha = 1;
                this.bgStateId = this.bgStates.shown;
                this.textStateId = this.textStates.showing;
                this.textHScrollPos = 0;
            }

        }else if(this.bgStateId == this.bgStates.hiding){
            if(this.bgTime < this.bgHideDuration){
                var t = this.bgTime / this.bgHideDuration;
                this.bgAlpha = 1-t;
                this.bgTime += ig.system.tick;
            }else{
                this.bgTime = 0;
                this.bgAlpha = 0;
                this.bgStateId = this.bgStates.hidden;

                if(this.curStageId >= this.stages.length-1){
                    if(typeof(this.onTutorialBoxHidden) == 'function'){
                        this.onTutorialBoxHidden(this.curStageId);
                    }
                }
            }

        }

        if(this.textStateId == this.textStates.showing){
            if(this.textTime < this.textShowDuration){
                var t = this.textTime / this.textShowDuration;
                this.textAlpha = t;
                this.textTime += ig.system.tick;
            }else{
                this.textAlpha = 1;
            }

            var stage = this.getCurStage();
            var str = stage.message;
            if(this.textHScrollPos < str.length){
                this.textHScrollPos += this.textHScrollRate * ig.system.tick;

                if(this.detectPlayerInput()){
                    var p = this.getInputPos();
                    var r1 = {};
                    r1.x = p.x;
                    r1.y = p.y;
                    r1.w = 1;
                    r1.h = 1;
                    var r2 = {};
                    r2.x = this.pos.x + this.rect.x;
                    r2.y = this.pos.y + this.rect.y;
                    r2.w = this.rect.w;
                    r2.h = this.rect.h;
                    if(this.aabbCheck(r1, r2)){
                        this.textHScrollPos = str.length;
                        if(this.textAlpha == 1){
                            this.textTime = 0;
                            this.textStateId = this.textStates.shown;
                            if(typeof(this.onStageComplete) == 'function'){
                                this.onStageComplete(this.curStageId);
                            }
                        }
                    }
                }

            }else{
                this.textHScrollPos = str.length;
                if(this.textAlpha == 1){
                    this.textTime = 0;
                    this.textStateId = this.textStates.shown;
                    if(typeof(this.onStageComplete) == 'function'){
                        this.onStageComplete(this.curStageId);
                    }
                }
            }

        }else if(this.textStateId == this.textStates.shown){
            var stage = this.getCurStage();
            if(stage.continue){
                if(this.bgStateId == this.bgStates.shown){
                    this.textNextTime += ig.system.tick;
                    this.textNextAlpha = this.textNextTime%2;
                    if(this.textNextAlpha > 1){
                        this.textNextAlpha = 2-this.textNextAlpha;
                    }

                    if(this.detectPlayerInput()){
                        var p = this.getInputPos();
                        var r1 = {};
                        r1.x = p.x;
                        r1.y = p.y;
                        r1.w = 1;
                        r1.h = 1;
                        var r2 = {};
                        r2.x = this.pos.x + this.rect.x;
                        r2.y = this.pos.y + this.rect.y;
                        r2.w = this.rect.w;
                        r2.h = this.rect.h;
                        if(this.aabbCheck(r1, r2)){
                            this.gotoNextStage();
                        }else if(this.clickAnywhereToContinueFlag){
                            if(this.textStateId == this.textStates.showing ||
                                this.textStateId == this.textStates.shown){
                                if(this.textNextTime > 0.5){
                                    this.gotoNextStage();
                                }
                            }
                        }
                    }
                }
            }

        }else if(this.textStateId == this.textStates.hiding){
            if(this.textTime < this.textHideDuration){
                var t = this.textTime / this.textHideDuration;
                this.textAlpha = 1-t;
                this.textTime += ig.system.tick;
            }else{
                this.textTime = 0;
                this.textAlpha = 0;
                this.textStateId = this.textStates.hidden;

                if(this.curStageId+1 < this.stages.length){
                    this.gotoNextStage();
                    this.textStateId = this.textStates.showing;
                    this.textHScrollPos = 0;
                }else{
                    this.bgStateId = this.bgStates.hiding;
                    if(typeof(this.onStageEnd) == 'function'){
                        this.onStageEnd(this.curStageId);
                    }
                }
            }
        }
    },

    getCurStage: function(){
        if(this.curStageId >= 0 &&
           this.curStageId < this.stages.length){
            return this.stages[this.curStageId];
        }
        return null;
    },

    gotoNextStage: function(){
        if(this.textStateId == this.textStates.showing ||
           this.textStateId == this.textStates.shown){
            this.textStateId = this.textStates.hiding;
            this.textNextAlpha = 0;
            this.textNextTime = 0;

        }else if(this.textStateId == this.textStates.hidden){
            if(this.curStageId < this.stages.length){
                if(typeof(this.onStageEnd) == 'function'){
                    this.onStageEnd(this.curStageId);
                }
            }
            if(this.curStageId+1 < this.stages.length){
                this.curStageId += 1;
            }
        }
    },

    gotoPrevStage: function(){
        if(this.textStateId == this.textStates.showing ||
           this.textStateId == this.textStates.shown){
            this.textStateId = this.textStates.hiding;
            this.textNextAlpha = 0;
            this.textNextTime = 0;

        }else if(this.textStateId == this.textStates.hidden){
            if(this.curStageId-1 >= 0){
                this.curStageId -= 1;
            }
        }
    },

    show: function(){
        if(this.bgStateId == this.bgStates.hidden){
            this.bgStateId = this.bgStates.showing;
            this.textHScrollPos = 0;
            this.textNextAlpha = 0;
            this.textNextTime = 0;
        }
    },

    hide: function(){
        if(this.bgStateId == this.bgStates.shown){
            this.bgStateId = this.bgStates.hiding;
        }
    },

    drawBgBox: function(){
        var ctx = ig.system.context;

        var x = this.pos.x;
        var y = this.pos.y;

        var alpha = this.alpha * this.bgAlpha;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.translate(x, y);

        var r = this.rect;
        this.roundRect(ctx,
                       r.x,
                       r.y,
                       r.w,
                       r.h,
                       5,
                       true,
                       false);
        ctx.restore();
    },

    drawScrollText: function(){
        if(!this.textAlpha) return;

        var ctx = ig.system.context;

        var x = this.pos.x + this.rect.x + this.textPos.x + this.textRect.x;
        var y = this.pos.y + this.rect.y + this.textPos.y;

        var alpha = this.alpha * this.bgAlpha * this.textAlpha;

        var stage = this.getCurStage();
        var strList = stage.wrappedMessage;
        var pos = this.textHScrollPos;

        for(var i=0; i<strList.length; i++){
            var str = strList[i];
            if(this.rtlFlag){
                str = str.substr(str.length-pos, pos);
            }else{
                str = str.substr(0, pos);
            }
        }

        this.wrappedMessage = stage.wrappedMessage;
        var pos = this.textHScrollPos;
        var visibleLines = 0;
        for(var i=0; i<this.wrappedMessage.length; i++){
            var str = this.wrappedMessage[i];
            visibleLines += 1;
            if(pos < str.length){
                break;
            }
            pos -= str.length;
        }
        this.textHeightAdjustment = this.textLineHeight*0.8 - visibleLines/2*this.textLineHeight;
        y += this.textHeightAdjustment;

        ctx.save();
        ctx.font = this.textFontSize + "px " + this.textFont;
        ctx.textAlign = "left";
        if(this.rtlFlag){
            x += this.textRect.w;
            ctx.textAlign = "right";
        }
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.fillStyle = 'rgba(255,255,255,1)';

        var pos = this.textHScrollPos;
        var modY = 0;
        for(var i=0; i<this.wrappedMessage.length; i++){
            var str = this.wrappedMessage[i];
            if(pos < str.length){
                if(this.rtlFlag){
                    if(pos < this.wrappedMessage[i].length-1){
                        str = str.substr(str.length-pos, pos);
                    }
                }else{
                    str = str.substr(0, pos);
                }
            }
            ctx.fillText(str, 0, modY);
            modY += this.textLineHeight;
            pos -= this.wrappedMessage[i].length;
            if(pos < 0) break;
        }

        ctx.restore();
    },

    drawNextText: function(){
        if(!this.textNextAlpha) return;

        var str = this.textNext;
        var ctx = ig.system.context;

        var x = this.pos.x + this.rect.x + this.textNextPos.x;
        var y = this.pos.y + this.rect.y + this.textNextPos.y;

        var alpha = this.alpha * this.bgAlpha * this.textNextAlpha;

        ctx.save();
        ctx.font = this.textNextFontSize + "px " + this.textFont;
        ctx.textAlign = this.textNextAlign;
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);

        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.fillText(str, 0, 0);

        ctx.restore();
    },

    detectPlayerInput: function(){
        if(ig.input.released(this.keyStateName)) return true;
        if(ig.input.released(this.clickStateName)) return true;

        return false;
    },

    getInputPos: function() {
        return ig.game.io.getClickPos();
    },

    aabbCheck: function(aabb1, aabb2) {
        if(aabb1.x + aabb1.w > aabb2.x &&
           aabb1.x < aabb2.x + aabb2.w &&
           aabb1.y + aabb1.h > aabb2.y &&
           aabb1.y < aabb2.y + aabb2.h ) {
            return true;
        }
        return false;
    },

    roundRect: function(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke == "undefined" ) {
            stroke = true;
        }
        if (typeof radius === "undefined") {
            radius = 5;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke) {
            ctx.stroke();
        }
        if (fill) {
            ctx.fill();
        }
    },

    wrapText: function(text, maxWidth, fontSize, font, preserveWordsFlag) {
        var ctx = ig.system.context;
        ctx.font = fontSize + "px " + font;

        var words = text.split(" ");
        var line = "";

        var arr = [];
        if(words.length == 1){
            for(var n=0, nl=text.length; n<nl; n++){
                var testLine = line + text[n];
                var metrics = ctx.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    arr.push(line);
                    line = text[n];
                }
                else {
                    line = testLine;
                }
            }
            arr.push(line);
        }else{
            //for each word
            for(var n=0, nl=words.length; n<nl; n++){
                //condition for splitting: if word length is too long
                var metrics = ctx.measureText(line + words[n]);
                if (!preserveWordsFlag && metrics.width > maxWidth){
                    //for each character in the word
                    for(var c=0, cl=words[n].length; c<cl; c++){
                        var testLine = line + words[n][c];
                        var metrics = ctx.measureText(testLine);
                        var testWidth = metrics.width;
                        if (testWidth > maxWidth && c > 0) {
                            arr.push(line);
                            line = words[n][c];
                        }
                        else {
                            line = testLine;
                        }
                    }
                    line = line + " ";
                }else{
                    var testLine = line + words[n] + " ";
                    var metrics = ctx.measureText(testLine);
                    var testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0){
                        arr.push(line);
                        line = words[n] + " ";
                    }else{
                        line = testLine;
                    }
                }
            }
            arr.push(line);
        }

        return arr;
    },

    getTextColorStr: function() {
        return "rgba("+this.textColor.r+","+this.textColor.g+","+this.textColor.b+","+this.textAlpha+")";
    },
});
});
