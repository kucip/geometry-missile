ig.module('game.entities.text')
.requires(
	'impact.entity'
)
.defines(function() {
	EntityText = ig.Entity.extend({
		text:'',

		size:{x:32,y:32},
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(255, 255, 255, 0.5)',
		zIndex: 10000,
		
		init:function(x,y,settings){
			this.parent(x,y,settings);
			
			if(typeof(wm)=='undefined'){
				if(settings){
					this.name = settings.name;
					
					// TEXT
					this.useLanguageFile = settings.useLanguageFile;
					this.languageFileSectionName = settings.languageFileSectionName;
					
					if(eval(this.useLanguageFile)){
						this.text = ig.game.language.selected[this.languageFileSectionName][settings.text];
					}else{
						this.text = settings.text;
					}
					
					// TEXT STYLE
					this.fontSize = settings.fontSize;
					if(!this.fontSize) this.fontSize = '24'; // DEFAULT, IF NONE CHOSEN
					
					this.fontStyle = settings.fontStyle;
					if(!this.fontStyle) this.fontStyle = 'Arial'; // DEFAULT, IF NONE CHOSEN
					
					this.fontWeight = settings.fontWeight;
					if(!this.fontWeight) this.fontWeight = 'bold'; // DEFAULT, IF NONE CHOSEN
					
					this.fontColor = settings.fontColor;
					if(!this.fontColor) this.fontColor = '#fff'; // DEFAULT, IF NONE CHOSEN
					
					// BACKGROUND
					this.backgroundBorderColor = settings.backgroundBorderColor;
					this.backgroundColor = settings.backgroundColor;
					this.backgroundHeight = settings.backgroundHeight;
					
				}
			}
		},
		
		draw:function(){
			this.parent();

			if(this.backgroundBorderColor){
				ig.system.context.fillStyle = this.backgroundBorderColor;
				ig.system.context.fillRect( 0, this.pos.y-this.size.y + 10 -5 , ig.system.width, this.backgroundHeight + 10 );				
			}

			if(this.backgroundColor){
				ig.system.context.fillStyle = this.backgroundColor;
				ig.system.context.fillRect( 0, this.pos.y-this.size.y + 10, ig.system.width, this.backgroundHeight );				
			}

						
			if(typeof(wm)=='undefined'){
				ig.system.context.fillStyle = this.fontColor;
				ig.system.context.font = this.fontWeight + " " + this.fontSize + "px" + " " + this.fontStyle;
				ig.system.context.fillText(this.text, this.pos.x - ig.system.context.measureText(this.text).width/2, this.pos.y+this.size.y);				
			}

		}
		
	});

});