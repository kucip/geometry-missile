/* MarketJS input query plugin*/
ig.module(
	'plugins.clickable-div-layer'
)
.requires(
	'plugins.data.vector'
)
.defines(function () {
	ClickableDivLayer = ig.Class.extend({

		pos: new Vector2(0, 0),
		size: new Vector2(0, 0),
		identifier: null,
		invisImagePath: 'media/graphics/misc/invisible.png',
		init: function (entity) {
			this.pos = new Vector2(entity.pos.x, entity.pos.y);
			this.size = new Vector2(entity.size.x, entity.size.y);

			var div_layer_name = "more-games";
			var link = "https://www.marketjs.com";
			var newWindow = false;

			if (entity.div_layer_name) {
				//console.log('settings found ... using that div layer name')
				div_layer_name = entity.div_layer_name;
			}
			if (entity.link) {
				link = entity.link;
			}
			if (entity.newWindow) {
				newWindow = entity.newWindow;
			}
			this.createClickableLayer(div_layer_name, link, newWindow);
		},

		createClickableLayer: function (divID, outboundLink, open_new_window) {
			this.identifier = divID;
			var id = "#" + divID;
			var elem = ig.domHandler.getElementById(id);

			if (elem) {
				ig.domHandler.show(elem);
				ig.domHandler.attr(elem, 'href', outboundLink);
			} else {
				this.createClickableOutboundLayer(divID, outboundLink, this.invisImagePath, open_new_window);
			}

		},

		update: function (x, y) {
			if(this.pos.x === x && this.pos.y === y) return;
			this.updatePos(x, y);
		},

		updatePos: function (x, y) {
			this.pos.x = x;
			this.pos.y = y;
			ig.sizeHandler.dynamicClickableEntityDivs[this.identifier] = {};
			ig.sizeHandler.dynamicClickableEntityDivs[this.identifier]['width'] = this.size.x;
			ig.sizeHandler.dynamicClickableEntityDivs[this.identifier]['height'] = this.size.y;
			ig.sizeHandler.dynamicClickableEntityDivs[this.identifier]['entity_pos_x'] = this.pos.x;
			ig.sizeHandler.dynamicClickableEntityDivs[this.identifier]['entity_pos_y'] = this.pos.y;
		},

		createClickableOutboundLayer: function (id, outbound_link, image_path, open_new_window) {
			// CREATE LAYER
			//console.log("create clickable outbound layer");

			var div = ig.domHandler.create("div");
			ig.domHandler.attr(div, "id", id);


			var newLink = ig.domHandler.create('a');

			/* PATCH FOR ISSUE #8 */
			/* PREVENT DEFAULT MOUSEDOWN BEHAVIOR */
			ig.domHandler.addEvent(div, "mousedown", function (e) {
				e.preventDefault();
			});

			// INJECT LINK AND IMAGE
			if (open_new_window) {
				ig.domHandler.attr(newLink, "href", outbound_link);
				ig.domHandler.attr(newLink, "target", "_blank");
			} else {
				ig.domHandler.attr(newLink, "href", outbound_link);
			}

			var linkImg = ig.domHandler.create('img');

			ig.domHandler.css(linkImg, {
				width: "100%",
				height: "100%"
			});
			ig.domHandler.attr(linkImg, "src", image_path);

			var aspectRatioMin = Math.min(ig.sizeHandler.scaleRatioMultiplier.x, ig.sizeHandler.scaleRatioMultiplier.y);
			if (ig.ua.mobile) {
				var canvas = ig.domHandler.getElementById("#canvas");

				var offsets = ig.domHandler.getOffsets(canvas);

				var offsetLeft = offsets.left;
				var offsetTop = offsets.top;

				// console.log(offsets.left)

				if (ig.sizeHandler.disableStretchToFitOnMobileFlag) {
					var divleft = Math.floor(offsetLeft + this.pos.x * ig.sizeHandler.scaleRatioMultiplier.x) + "px";
					var divtop = Math.floor(offsetTop + this.pos.y * ig.sizeHandler.scaleRatioMultiplier.y) + "px";
					var divwidth = Math.floor(this.size.x * ig.sizeHandler.scaleRatioMultiplier.x) + "px";
					var divheight = Math.floor(this.size.y * ig.sizeHandler.scaleRatioMultiplier.y) + "px";
				} else {
					var divleft = Math.floor(this.pos.x * ig.sizeHandler.sizeRatio.x) + "px";
					var divtop = Math.floor(this.pos.y * ig.sizeHandler.sizeRatio.y) + "px";
					var divwidth = Math.floor(this.size.x * ig.sizeHandler.sizeRatio.x) + "px";
					var divheight = Math.floor(this.size.y * ig.sizeHandler.sizeRatio.y) + "px";
				}

				ig.domHandler.css(div, {
					float: "left",
					position: "absolute",
					left: divleft,
					top: divtop,
					width: divwidth,
					height: divheight,
					"z-index": 3
				});
			} else {
				var canvas = ig.domHandler.getElementById("#canvas");

				var offsets = ig.domHandler.getOffsets(canvas);

				var offsetLeft = offsets.left;
				var offsetTop = offsets.top;

				var divleft = Math.floor(offsetLeft + this.pos.x * aspectRatioMin) + "px";
				var divtop = Math.floor(offsetTop + this.pos.y * aspectRatioMin - ig.game.screen.y) + "px";
				var divwidth = Math.floor(this.size.x * aspectRatioMin) + "px";
				var divheight = Math.floor(this.size.y * aspectRatioMin) + "px";

				ig.domHandler.css(div, {
					float: "left",
					position: "absolute",
					left: divleft,
					top: divtop,
					width: divwidth,
					height: divheight,
					"z-index": 3
				});
			}

			ig.domHandler.addEvent(div, 'mousemove', ig.input.mousemove.bind(ig.input), false);


			ig.domHandler.appendChild(newLink, linkImg);
			ig.domHandler.appendChild(div, newLink);

			ig.domHandler.appendToBody(div);




			// ADD TO HANDLER FOR RESIZING
			ig.sizeHandler.dynamicClickableEntityDivs[id] = {};
			//ig.sizeHandler.dynamicClickableEntityDivs[id]['width'] = this.size.x*ig.sizeHandler.multiplier;
			//ig.sizeHandler.dynamicClickableEntityDivs[id]['height'] = this.size.y*ig.sizeHandler.multiplier;
			ig.sizeHandler.dynamicClickableEntityDivs[id]['width'] = this.size.x;
			ig.sizeHandler.dynamicClickableEntityDivs[id]['height'] = this.size.y;
			ig.sizeHandler.dynamicClickableEntityDivs[id]['entity_pos_x'] = this.pos.x;
			ig.sizeHandler.dynamicClickableEntityDivs[id]['entity_pos_y'] = this.pos.y;

		},


	});
});