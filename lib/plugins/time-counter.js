/**
 * Used to generate counting down. It will convert remaining time on ig.Timer into
 * day, hour, minute, and second
 * 
 * - Progress feature: getting ratio of the time remaining. (increment)
 * 
 * @version 1.0.0
 * 
 * @since 1.0.0
 * @example
 * 
 *     //How to use
 *     //---------------
 *     //Call it once
 *     //---------------
 *     var cDown = new ig.Timer(10);
 *     
 *     //---------------
 *     //Call it durring update or draw
 *     //---------------
 *     var iCountdown = cDown.countdown();
 *     //iCountdown = {d:number, h: number, m: number, s: number};
 * 
 *     var iCountup = cDown.countup();
 *     //iCountup = {d:number, h: number, m: number, s: number};
 *     
 *     cDown.countToString(iCountdown); //parameter = object of countdown or countup
 *     //iCountdown = {dd:string, hh: string, mm: string, ss: string};
 *     
 *     var progress = cDown.progress();
 *     //progress = number from 0-1;
 * 
 * 
 */
ig
.module('plugins.time-counter')
.requires('impact.timer')
.defines(function () {
    ig.Timer.inject({
        seconds:0,
        minutes:0,
        hours:0,
        days:0,
        storedDelta:0,
        init: function(value){
            this.parent(value);
        },
        set: function(value){
            this.parent(value);
            this.countSet();
        },
        reset: function(){
            this.parent();
            this.countSet();
        },
        countSet: function(){
            var delta = Math.abs(Math.floor(this.delta()));
            this.storedDelta = delta;
            this.days = Math.floor(delta/86400);
            this.hours = Math.floor((delta/3600)%24);
            this.minutes = Math.floor((delta/60)%60);
            this.seconds = delta%60;
        },
        countConvert: function(delta,down){
            if(down){
                if(this.storedDelta>delta){
                    this.storedDelta=delta;
                    //more then, this means time has passed
                    this.seconds--;
                    if(this.seconds<0){
                        this.seconds=59;
                        this.minutes--;
                        if(this.minutes<0){
                            this.minutes=59;
                            this.hours--;
                            if(this.hours<0){
                                this.hours=24;
                                this.days--;
                            }
                        }
                    }
                }else if(this.storedDelta<delta){
                    this.countSet();
                }
            }
            else{
                if(this.storedDelta<delta){
                    this.storedDelta=delta;
                    //more then, this means time has passed
                    this.seconds++;
                    if(this.seconds>60){
                        this.seconds=0;
                        this.minutes++;
                        if(this.minutes>60){
                            this.minutes=0;
                            this.hours++;
                            if(this.hours>24){
                                this.hours=0;
                                this.days++;
                            }
                        }
                    }
                }else if(this.storedDelta>delta){
                    this.countSet();
                }
            }        
            
            return { d: this.days, h: this.hours, m: this.minutes, s: this.seconds };
        },
        countup: function () {
            if (this.delta() < 0) return { d: 0, h: 0, m: 0, s: 0 };
            return this.countConvert(Math.floor(this.delta()));
        },
        countdown: function () {
            if (this.delta() > 0) return { d: 0, h: 0, m: 0, s: 0 };
            return this.countConvert(Math.abs(Math.floor(this.delta())), true);
        },
        countToString: function (obj) {
            return {
                d: ("0" + obj.d).slice(-2),
                h: ("0" + obj.h).slice(-2),
                m: ("0" + obj.m).slice(-2),
                s: ("0" + obj.s).slice(-2)
            };
        },
        progress: function () {
            if (this.delta() > 0) return 1;
            return (this.target + this.delta()) / this.target;
        },
    });
});