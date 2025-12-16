/**
 *  Repos - Only use when there is both portrait and landscape mode for the mobile version.
 *  Place one in any level that mobile orientation repositioning is needed
 *
 *  Created by Isaac Choi on 2013-04-09.
 *  Copyright (c) 2013 __MyCompanyName__. All rights reserved.
 */

ig.module('game.entities.repos')
.requires(
    'impact.entity'
)
.defines(function () {
    EntityRepos = ig.Entity.extend({
        size: { x: 48, y: 48 },
		name: 'repos',
    
        init: function (x, y, settings) {
            this.parent(x, y, settings);
        },

		repositionAllEntities:function(){
			var currentLevel = ig.game.director.currentLevel;
			
			//Always synchronize this director with the one in main.js 
			//DO NOT JUST COPY AND PASTE THE WHOLE THING FROM main.js
			if(portraitMode){
				ig.game.director = new ig.Director(ig.game,[
					LevelInstructionPortrait,
					LevelGamePortrait,
					LevelResultPortrait
				]);										
			}else{
				ig.game.director = new ig.Director(ig.game,[
					LevelInstructionLandscape,
					LevelGameLandscape,
					LevelResultLandscape
				]);										
			}
			
			ig.game.director.loadLevelWithoutEntities(currentLevel);
			
		
			for(y = ig.game.entities.length-1; y>-1; y--){
				if(ig.game.entities[y]){					
					ig.game.entities[y].reposition();
				}
			}
	
		},
    
    });

});