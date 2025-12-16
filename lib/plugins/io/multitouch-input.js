ig.module(
		'plugins.io.multitouch-input'
	)
	.requires()
	.defines(function() {

		ig.MultitouchInput = ig.Class.extend({

			isStart: false,
			touches: [],

			multitouchCapable: false,
			lastEventUp: null,

			start: function() {

				// Note we have to rely on the ig.input since Dominic define the mouse
				// events there
				if (this.isStart) {
					return;
				}
				this.isStart = true;

				if (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) {
					//alert("hurray multitouch");
					this.multitouchCapable = true;
				}

				//The multitouch in ImpactJS is very wonky 
				//but not the fault of ImpactJS but browser implementations
				if (ig.ua.touchDevice) {
					// Standard
					if (window.navigator.msPointerEnabled) {
						// MS

						ig.system.canvas.addEventListener('MSPointerDown', this.touchdown.bind(this), false);
						ig.system.canvas.addEventListener('MSPointerUp', this.touchup.bind(this), false);
						ig.system.canvas.addEventListener('MSPointerMove', this.touchmove.bind(this), false);

						ig.system.canvas.style.msContentZooming = "none";
						ig.system.canvas.style.msTouchAction = 'none';
					}

					// Standard
					ig.system.canvas.addEventListener('touchstart', this.touchdown.bind(this), false);
					ig.system.canvas.addEventListener('touchend', this.touchup.bind(this), false);
					ig.system.canvas.addEventListener('touchmove', this.touchmove.bind(this), false);
				}
			},

			touchmove: function(event) {

				// if mobile we need to save the touches because this game will have multitouch
				if (ig.ua.touchDevice) {
					var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
					var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;

					var scaleX = ig.system.scale * (internalWidth / ig.system.realWidth);
					var scaleY = ig.system.scale * (internalHeight / ig.system.realHeight);
					if (event.touches) {
						while (this.touches.length > 0) //Empty the touches array
						{
							this.touches.pop();
						}
						//console.log(this.touches.length);

						if (!this.multitouchCapable) {
							if (event.touches.length > 1) {
								//alert("hurray multitouch");
								this.multitouchCapable = true;
							}
						}
						var pos = {
							left: 0,
							top: 0
						};
						if (ig.system.canvas.getBoundingClientRect) {
							pos = ig.system.canvas.getBoundingClientRect();
						}
						for (var i = 0; i < event.touches.length; i++) //refill the touches array with new data
						{
							var touch = event.touches[i];
							//console.log("id:"+touch.identifier);
							if (touch) {
								var touchX = (touch.clientX - pos.left) / scaleX;
								var touchY = (touch.clientY - pos.top) / scaleY;
								this.touches.push({
									x: touchX,
									y: touchY
								});
							}
						}
						//console.log(this.touches.length);

					} else {
						//Added for window multi touch detection in ie10 mobile
						this.windowMove(event);
					}
				}

				/* attempt to unlock WebAudio */
				try {
					ig.soundHandler.unlockWebAudio();
				} catch (error) {}
			},

			touchdown: function(event) {

				var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
				var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;

				var scaleX = ig.system.scale * (internalWidth / ig.system.realWidth);
				var scaleY = ig.system.scale * (internalHeight / ig.system.realHeight);

				if (window.navigator.msPointerEnabled) {
					//Added for window multi touch detection in ie10 mobile
					this.windowKeyDown(event);
				} else {
					// if mobile we need to save the touches because this game will have multitouch
					if (ig.ua.touchDevice) {
						if (event.touches) {
							while (this.touches.length > 0) //Empty the touches array
							{
								this.touches.pop();
							}
							//console.log(this.touches.length);

							if (!this.multitouchCapable) {
								if (event.touches.length > 1) {
									//alert("hurray multitouch");
									this.multitouchCapable = true;
								}
							}

							var pos = {
								left: 0,
								top: 0
							};
							if (ig.system.canvas.getBoundingClientRect) {
								pos = ig.system.canvas.getBoundingClientRect();
							}
							for (var i = 0; i < event.touches.length; i++) //refill the touches array with new data
							{
								var touch = event.touches[i];
								//console.log("id:"+touch.identifier);
								if (touch) {
									var touchX = (touch.clientX - pos.left) / scaleX;
									var touchY = (touch.clientY - pos.top) / scaleY;
									this.touches.push({
										x: touchX,
										y: touchY
									});
								}
							}
							//console.log(this.touches.length);

						}
					}
				}

			},


			touchup: function(event) {
				var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
				var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;

				var scaleX = ig.system.scale * (internalWidth / ig.system.realWidth);
				var scaleY = ig.system.scale * (internalHeight / ig.system.realHeight);
				if (window.navigator.msPointerEnabled) {
					//Added for window multi touch detection in ie10 mobile
					this.windowKeyUp(event);
				} else {
					this.lastEventUp = event;

					var pos = {
						left: 0,
						top: 0
					};
					if (ig.system.canvas.getBoundingClientRect) {
						pos = ig.system.canvas.getBoundingClientRect();
					}
					//console.log("id:"+touch.identifier);
					if (ig.ua.touchDevice) // Which means there is no mouse controls
					{
						var touch = event.changedTouches[0];
						//console.log("id:"+touch.identifier);
						var touchX = (touch.clientX - pos.left) / scaleX;
						var touchY = (touch.clientY - pos.top) / scaleY;

						for (var iTouch = 0; iTouch < this.touches.length; iTouch++) {
							if (this.touches[iTouch].x >= touchX - 40 &&
								this.touches[iTouch].x <= touchX + 40
							) {
								this.touches.splice(iTouch, 1);
							}
						}
					}

					/*
					while(this.touches.length>0) //Empty the touches array
					{
						this.touches.pop();
					}
					*/
					//need to check if touches remain
				}

				if (ig.visibilityHandler) {
					ig.visibilityHandler.onChange("focus");
				}
				
				/* attempt to unlock WebAudio */
				try {
					ig.soundHandler.unlockWebAudio();
				} catch (error) {}
			},

			windowKeyDown: function(event) {
				var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
				var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;

				var scaleX = ig.system.scale * (internalWidth / ig.system.realWidth);
				var scaleY = ig.system.scale * (internalHeight / ig.system.realHeight);
				if (window.navigator.msPointerEnabled) {
					var pos = {
						left: 0,
						top: 0
					};
					if (ig.system.canvas.getBoundingClientRect) {
						pos = ig.system.canvas.getBoundingClientRect();
					}

					var pointerList = event.changedTouches ? event.changedTouches : [event];
					for (var i = 0; i < pointerList.length; ++i) {
						var pointerObj = pointerList[i];
						var pointerId = (typeof pointerObj.identifier != 'undefined') ? pointerObj.identifier : (typeof pointerObj.pointerId != 'undefined') ? pointerObj.pointerId : 1;
						output += pointerId + ":";
						var clientX = pointerObj.clientX;
						var clientY = pointerObj.clientY;

						var touchX = (pointerObj.clientX - pos.left) / scaleX;
						var touchY = (pointerObj.clientY - pos.top) / scaleY;

						for (var tindex3 = 0; tindex3 < this.touches.length; ++tindex3) {
							if (this.touches[tindex3].identifier == pointerId) // the id already exists so do not push it into touches
							{
								this.touches.splice(tindex3, 1);
							}
						}
						this.touches.push({
							x: touchX,
							y: touchY,
							identifier: pointerId
						});
					}
					var output = "" + this.multitouchCapable + ":";
					for (var k = 0; k < this.touches.length; k++) {
						output += this.touches[k].identifier + ":";
					}
				}
			},

			windowKeyUp: function(event) {
				var pointerId = (typeof event.identifier != 'undefined') ? event.identifier : (typeof event.pointerId != 'undefined') ? event.pointerId : 1;
				for (var tindex2 = 0; tindex2 < this.touches.length; ++tindex2) {
					//Remove pointer from the touches array since it is up
					if (this.touches[tindex2].identifier == pointerId) {
						this.touches.splice(tindex2, 1);
					}
				}
				while (this.touches.length > 0) {
					this.touches.pop();
				}

				if (ig.visibilityHandler) {
					ig.visibilityHandler.onChange("focus");
				}
				
				/* attempt to unlock WebAudio */
				try {
					ig.soundHandler.unlockWebAudio();
				} catch (error) {}
			},
			windowMove: function(event) {
				var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
				var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;

				var scaleX = ig.system.scale * (internalWidth / ig.system.realWidth);
				var scaleY = ig.system.scale * (internalHeight / ig.system.realHeight);
				var pos = {
					left: 0,
					top: 0
				};
				if (ig.system.canvas.getBoundingClientRect) {
					pos = ig.system.canvas.getBoundingClientRect();
				}
				if (window.navigator.msPointerEnabled) {
					var pointerId = (typeof event.identifier != 'undefined') ? event.identifier : (typeof event.pointerId != 'undefined') ? event.pointerId : 1;
					//update the touches if the pointer id exists in touches
					for (var tindex = 0; tindex < this.touches.length; ++tindex) {
						if (this.touches[tindex].identifier == pointerId) {
							var touchX = (event.clientX - pos.left) / scaleX;
							var touchY = (event.clientY - pos.top) / scaleY;
							this.touches[tindex].x = touchX;
							this.touches[tindex].y = touchY;
						}
					}
				}

				/* attempt to unlock WebAudio */
				try {
					ig.soundHandler.unlockWebAudio();
				} catch (error) {}
			},
			clear:function()
			{
				for(var tindex = 0; tindex < this.released.length; ++tindex)
				{
					if(this.released[tindex])
					{
						this.released.splice(tindex,1);
						tindex--;
					}
				}
			},
		
			pollMultitouch:function(lengthTouches)
			{
				if(!this.multitouchCapable)
				{
					if(lengthTouches>1)
					{
						//alert("hurray multitouch");
						this.multitouchCapable=true;
					}
				}
			},
		
			spliceFromArray:function(arrayToSplice,arrayToCheckWith)
			{
				for(var i=0;i<arrayToCheckWith.length;i++)
				{
					for(var j=0;j<arrayToSplice.length;j++)
					{
						if(arrayToSplice[j].identifier === arrayToCheckWith[i].identifier)
						{
							arrayToSplice.splice(j,1);
							j--;
						}
					}
				}
			},
		
			updateSizeProperties:function()
			{
				var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
				var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;
		
				this.scaleX = ig.system.scale * (internalWidth / ig.system.realWidth);
				this.scaleY = ig.system.scale * (internalHeight / ig.system.realHeight);
			},
		
			upgrade:function(arrayToCheck,arrayToUpgradeTo,touch)
			{
				var pos = {left: 0, top: 0};
				if( ig.system.canvas.getBoundingClientRect ) {
					pos = ig.system.canvas.getBoundingClientRect();
				}


				var touchX=(touch.clientX- pos.left)/this.scaleX;
				var touchY=(touch.clientY- pos.top)/this.scaleY;
			
			
				for(var iTouch=0;iTouch<arrayToCheck.length;iTouch++)
				{
					if(typeof(arrayToCheck[iTouch].identifier) !== undefined
						&& typeof(touch.identifier)  !== undefined
					  && touch.identifier === arrayToCheck[iTouch].identifier)
					{
						arrayToCheck.splice(iTouch,1);
						arrayToUpgradeTo.push({identifier:touch.identifier,x:touchX,y:touchY});
						iTouch--;
						break;
					}   
				}
			},
		
			updateArray:function(arrayToUpdate,touch)
			{
				var pos = {left: 0, top: 0};
				if( ig.system.canvas.getBoundingClientRect ) {
					pos = ig.system.canvas.getBoundingClientRect();
				}

				var touchX=(touch.clientX- pos.left)/this.scaleX;
				var touchY=(touch.clientY- pos.top)/this.scaleY;
			
				for(var iTouch=0;iTouch<arrayToUpdate.length;iTouch++)
				{
					if(typeof(arrayToUpdate[iTouch].identifier) !== undefined
						&& typeof(touch.identifier)  !== undefined
					  && touch.identifier === arrayToUpdate[iTouch].identifier)
					{
					
						arrayToUpdate[iTouch].x=touchX;
						arrayToUpdate[iTouch].y=touchY;
						break;
					}   
				}
			}
		
		});

	});