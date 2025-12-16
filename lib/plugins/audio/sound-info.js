/**
 *  SoundHandler
 *
 *  Created by Justin Ng on 2014-08-19.
 *  Copyright (c) 2014 __MyCompanyName__. All rights reserved.
 */

ig.module('plugins.audio.sound-info')
.requires(
)
.defines(function () {

    SoundInfo = ig.Class.extend({
		/* MP3 ONLY, root folder is media/audio/ */

		sfx: {
			logosplash1: { path: "opening/logosplash1" },
			logosplash2: { path: "opening/logosplash2" },
			click:{path:"ingame/click"},
			swipe:{path:"ingame/swipe"},
			explosion:{path:"ingame/explosion"},
			hit:{path:"ingame/hit"},
		},
		
		bgm:{
			background:{path:'bgm',startOgg:0,endOgg:21.463,startMp3:0,endMp3:21.463,loop:true},
		}
    });

});
