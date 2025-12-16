ig.module('game.entities.ingame.editor-controller')
.requires(
    'impact.entity',
    'game.entities.ingame.obstacle',
    'game.entities.ingame.gate',
    'game.entities.ingame.player',
    'game.polygon-collider'
)
.defines(function() {
    EntityEditorController = ig.Entity.extend({
        zIndex: 0,
        pos:new Vector2(0,0),
        size:new Vector2(0,0),

        bg: null,
        isPaused: false,
        gameStarted: false,
        player: null,
        mapSize: {
            width: 1000,
            height: 1600
        },
        clipboardData: null,
        init:function(x,y,settings){
            this.parent(x,y,settings);
            ig.game.controller = this;
            this.repos();

            ig.input.bind(ig.KEY.CTRL, 'ctrl');
            ig.input.bind(ig.KEY.C, 'c');
            ig.input.bind(ig.KEY.V, 'v');

            this.createControlPanel();
            this.renderShapeList();
            
            // Prevent default context menu on right-click
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
            });
        },

        copyObstacle: function (obstacle) {
            this.clipboardData = {
                type: 'obstacle',
                shapeType: obstacle.shapeType,
                scale: {
                    x: obstacle.scale.x,
                    y: obstacle.scale.y
                },
                flip: {
                    x: obstacle.flip.x,
                    y: obstacle.flip.y
                }
            };
        },

        pasteObstacle: function () {
            if (!this.clipboardData) {
                console.log('Nothing to paste');
                return;
            }
            var p = ig.game.io.getClickPos();

            ig.game.spawnEntity(EntityObstacle, p.x + ig.game.screen.x, p.y + ig.game.screen.y, {
                shapeType: this.clipboardData.shapeType,
                scale: {
                    x: this.clipboardData.scale.x,
                    y: this.clipboardData.scale.y
                },
                flip: {
                    x: this.clipboardData.flip.x,
                    y: this.clipboardData.flip.y
                },
                placeOn: "mid",
                offPosY: 0
            });
        },

        update: function() {
            this.parent();

            if (ig.input.pressed('left') || ig.input.state('left')) {
                ig.game.screen.x = Math.max(0, ig.game.screen.x - 100);
            }
            if (ig.input.pressed('right') || ig.input.state('right')) {
                ig.game.screen.x += 100;
            }
            if(ig.input.state('ctrl') && ig.input.pressed('v')) {
                ig.game.controller.pasteObstacle();
            }
        },
        
        draw: function() {
            this.parent();
            var ctx = ig.system.context;
            ctx.save();
            ctx.fillStyle = '#181A20';
            ctx.fillRect(0, 0, ig.system.width, ig.system.height);
            ctx.restore();

            if (this.mapArea) {
                ctx.save();
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, ig.system.width, this.mapArea.top);
                ctx.fillRect(0, this.mapArea.bottom, ig.system.width, ig.system.height - this.mapArea.bottom);
                
                // Add white border lines at ceiling edges
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 7;
                ctx.beginPath();
                // Top ceiling border
                ctx.moveTo(0, this.mapArea.top);
                ctx.lineTo(ig.system.width, this.mapArea.top);
                // Bottom ceiling border
                ctx.moveTo(0, this.mapArea.bottom);
                ctx.lineTo(ig.system.width, this.mapArea.bottom);
                ctx.stroke();

                ctx.save();
                ctx.font = 'bold 50px Arial';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Level ' + ig.game.level, ig.system.width / 2, this.mapArea.top / 2);
                ctx.restore();
                
                ctx.restore();
            }
        },

        repos: function() {
            if (ig.game.level) {
                var height = _MAP_SETTINGS['level'+ig.game.level].size.height;
            } else {
                var height = this.mapSize.height;
            }
            this.mapArea = {
                top: (ig.system.height - height) / 2,
                bottom: (ig.system.height + height) / 2,
            };
        },
        
        disableButtons: function(type) {
            type = type || false;

            for(var idx in this.buttons) {
                this.buttons[idx].enabled = !type;
                if(this.buttons[idx].onDisable instanceof Function)this.buttons[idx].onDisable()
            }
        },

        createControlPanel: function() {
            if (document.getElementById('shape-dropmenu')) return;

            // shape dropmenu
            var sd = document.createElement('div');
            sd.id = 'shape-dropmenu';
            sd.style.display = 'block';
            sd.style.position = 'fixed';
            sd.style.top = '10px';
            sd.style.right = '10px';
            sd.style.zIndex = 9999;

            var toggle = document.createElement('div');
            toggle.id = 'shape-dropmenu-toggle';
            toggle.style.background = '#222';
            toggle.style.color = '#fff';
            toggle.style.padding = '10px 20px';
            toggle.style.borderRadius = '8px';
            toggle.style.cursor = 'pointer';
            toggle.style.fontSize = '16px';
            toggle.style.userSelect = 'none';
            toggle.innerHTML = '<b>Obstacle Shapes ▼</b>';
            sd.appendChild(toggle);

            var ul = document.createElement('ul');
            ul.id = 'shape-list-ul';
            ul.style.display = 'none';
            ul.style.background = '#222';
            ul.style.color = '#fff';
            ul.style.padding = '10px 20px 10px 30px';
            ul.style.borderRadius = '0 0 8px 8px';
            ul.style.margin = '0';
            ul.style.maxWidth = '220px';
            ul.style.fontSize = '16px';
            ul.style.listStyle = 'none';
            ul.style.boxShadow = '0 4px 12px #0008';
            sd.appendChild(ul);

            document.body.appendChild(sd);

            // export-level block
            var ex = document.createElement('div');
            ex.id = 'export-level';
            ex.style.display = 'none';
            ex.style.position = 'fixed';
            ex.style.top = '60px';
            ex.style.right = '10px';
            ex.style.zIndex = 9999;

            var exBtn = document.createElement('button');
            exBtn.id = 'export-level-btn';
            exBtn.textContent = 'Export Level';
            exBtn.style.position = 'fixed';
            exBtn.style.top = '15px';
            exBtn.style.right = '260px';
            exBtn.style.zIndex = 10000;
            ex.appendChild(exBtn);

            var ta = document.createElement('textarea');
            ta.id = 'export-level-output';
            ta.style.display = 'none';
            ta.style.position = 'fixed';
            ta.style.top = '100px';
            ta.style.right = '10px';
            ta.style.width = '400px';
            ta.style.height = '400px';
            ta.style.zIndex = 10000;
            ex.appendChild(ta);

            document.body.appendChild(ex);

            toggle.addEventListener('click', function () {
                ul.style.display = (ul.style.display === 'block') ? 'none' : 'block';
            });
            document.addEventListener('mousedown', function (e) {
                if (!toggle.contains(e.target) && !ul.contains(e.target)) {
                    ul.style.display = 'none';
                }
            });
        },

        exportObstacleList: function () {
            var obstacles = ig.game.entities.filter(function (ent) {
                return ent instanceof EntityObstacle || ent instanceof EntityGate;
            });

            obstacles.sort(function (a, b) {
                return a.pos.x - b.pos.x;
            });

            var result = obstacles.map(function (ob) {
                var posY = ig.system.height / 2 - ob.pos.y;
                var pos = `pos: { x: ${ob.pos.x}, y: ${posY} }`;
                if (ob.shapeType == 'gate') {
                    // Gate format
                    return `{ obstacle: 'gate', size: { x: ${ob.size.x}, y: ${ob.size.y} }, ${pos} },`;
                } else {
                    // Obstacle format
                    return `{ obstacle: '${ob.shapeType || ob.obstacle}', scale: { x: ${ob.scale.x}, y: ${ob.scale.y} }, flip: { x: ${ob.flip.x}, y: ${ob.flip.y} }, ${pos} },`;
                }
            });

            var output = document.getElementById('export-level-output');
            if (output) {
                output.style.display = 'block';
                output.value = result.join('\n');
                output.select();

                var hideBtn = document.getElementById('hide-export-btn');
                if (hideBtn) {
                    hideBtn.style.display = 'inline-block';
                }
            } else {
                console.log(result.join('\n'));
            }
        },

        renderShapeList: function() {
            var dropMenu = document.getElementById('shape-dropmenu');
            var ul = document.getElementById('shape-list-ul');
            if (!ul || !dropMenu) return;
            dropMenu.style.display = 'block';
            ul.innerHTML = '';

            this.createLevelSelector(dropMenu);

            for (var key in _SHAPE_VERTICES.obstacles) {
                if (_SHAPE_VERTICES.obstacles.hasOwnProperty(key)) {
                    var li = document.createElement('li');
                    li.textContent = key;
                    li.style.cursor = 'pointer';
                    li.onclick = (function(shapeType){
                        return function() {
                            ig.game.spawnEntity(EntityObstacle, ig.system.width / 2 + ig.game.screen.x, ig.system.height / 2 + ig.game.screen.y, {
                                shapeType: shapeType,
                                scale: { x: 1, y: 1 },
                                flip: { x: 1, y: 1 },
                                placeOn: "mid",
                                offPosY: 0
                            });
                        };
                    })(key);
                    ul.appendChild(li);
                }
            }
            // Gate
            var gateLi = document.createElement('li');
            gateLi.textContent = 'Gate';
            gateLi.style.cursor = 'pointer';
            gateLi.onclick = function() {
                ig.game.spawnEntity(EntityGate, ig.system.width / 2 + ig.game.screen.x, ig.system.height / 2 + ig.game.screen.y, {
                    size: { x: 400, y: 400 },
                    placeOn: "mid",
                    offPosY: 0
                });
            };
            ul.appendChild(gateLi);


            var exportLevel = document.getElementById('export-level');
            if (!exportLevel) return;
            exportLevel.style.display = 'block';
            document.getElementById('export-level-btn').onclick = function() {
                ig.game.controller.exportObstacleList();
            };

            var hideBtn = document.getElementById('hide-export-btn');
            if (!hideBtn) {
                hideBtn = document.createElement('button');
                hideBtn.id = 'hide-export-btn';
                hideBtn.textContent = 'x';
                hideBtn.style.marginLeft = '10px';
                hideBtn.style.marginTop = '10px';
                hideBtn.style.padding = '5px 10px';
                hideBtn.style.backgroundColor = '#f44336';
                hideBtn.style.color = '#fff';
                hideBtn.style.border = 'none';
                hideBtn.style.borderRadius = '3px';
                hideBtn.style.cursor = 'pointer';
                hideBtn.style.display = 'none';

                var exportLevelBtn = document.getElementById('export-level-btn');
                if (exportLevelBtn && exportLevelBtn.parentNode) {
                    exportLevelBtn.parentNode.appendChild(hideBtn);
                }
            }

            hideBtn.onclick = function () {
                var output = document.getElementById('export-level-output');
                if (output) {
                    output.style.display = 'none';
                    hideBtn.style.display = 'none';
                }
            };
        },

        createLevelSelector: function (container) {
            var levelContainer = document.getElementById('level-selector-container');
            if (!levelContainer) {
                levelContainer = document.createElement('div');
                levelContainer.id = 'level-selector-container';
                levelContainer.style.marginBottom = '15px';
                levelContainer.style.padding = '5px';
                levelContainer.style.backgroundColor = '#2a2a2a';
                levelContainer.style.borderRadius = '5px';

                var label = document.createElement('label');
                label.textContent = 'Select Level: ';
                label.style.color = '#fff';
                label.style.marginRight = '10px';
                label.style.fontWeight = 'bold';

                var select = document.createElement('select');
                select.id = 'level-selector';
                select.style.padding = '5px';
                select.style.fontSize = '14px';
                select.style.backgroundColor = '#333';
                select.style.color = '#fff';
                select.style.border = '1px solid #555';
                select.style.borderRadius = '3px';

                levelContainer.appendChild(label);
                levelContainer.appendChild(select);
                container.insertBefore(levelContainer, container.firstChild);
            }

            var select = document.getElementById('level-selector');
            select.innerHTML = '';

            var defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Levels --';
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            // Populate levels
            for (var levelKey in _MAP_SETTINGS) {
                if (_MAP_SETTINGS.hasOwnProperty(levelKey)) {
                    var option = document.createElement('option');
                    option.value = levelKey.replace('level', '');
                    option.textContent = 'Level ' + levelKey.replace('level', '');
                    if (ig.game.level == option.value) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                }
            }

            var self = this;
            select.onchange = function () {
                var newLevel = parseInt(this.value, 10);
                ig.game.level = newLevel;

                self.repos();

                // remove existing obstacles and gates
                var obstacles = ig.game.entities.filter(function (ent) {
                    return ent instanceof EntityObstacle || ent instanceof EntityGate;
                });
                for (var i = 0; i < obstacles.length; i++) {
                    obstacles[i].kill();
                }

                self.spawnLevelObstacles(newLevel);
            };
        },

        spawnLevelObstacles: function (level) {
            var levelData = _MAP_SETTINGS['level' + level];
            if (!levelData || !levelData.obstacles) {
                console.log('No level data found for level ' + level);
                return;
            }

            var mapCenterY = ig.system.height / 2;

            for (var i = 0; i < levelData.obstacles.length; i++) {
                var obstacleData = levelData.obstacles[i];
                var posX = obstacleData.pos.x;
                var posY = mapCenterY - obstacleData.pos.y;

                if (obstacleData.obstacle == 'gate') {
                    // Spawn Gate
                    ig.game.spawnEntity(EntityGate, posX, posY, {
                        size: {
                            x: obstacleData.size.x,
                            y: obstacleData.size.y
                        }
                    });
                } else {
                    // Spawn Obstacle
                    ig.game.spawnEntity(EntityObstacle, posX, posY, {
                        shapeType: obstacleData.obstacle,
                        scale: {
                            x: obstacleData.scale.x,
                            y: obstacleData.scale.y
                        },
                        flip: {
                            x: obstacleData.flip.x,
                            y: obstacleData.flip.y
                        }
                    });
                }
            }
        }

    });

    EntityObstacle.inject({
        update: function() {
            this.parent();
            if(ig.game.editorMode) {
                if(this.underPointer()) {
                    if(ig.input.pressed('click') && !ig.game.draggingObs) {
                        ig.game.draggingObs = this;
                    }
                    if(ig.input.pressed('rClick')) {
                        this.showEditForm();
                    }
                    
                    if(ig.input.state('ctrl') && ig.input.pressed('c')) {
                        ig.game.controller.copyObstacle(this);
                    }
                        
                }

                if(ig.game.draggingObs == this) {
                    this.dragging();
                    if(ig.input.pressed('delete')) {
                        ig.game.draggingObs = null;                        
                        this.kill();
                    }
                    if(ig.input.released('click')) {
                        ig.game.draggingObs = null;                        
                    }
                }
            }
        },
        showEditForm: function() {
            var oldForm = document.getElementById('obstacle-edit-form');
            if (oldForm) oldForm.remove();

            // form
            var form = document.createElement('div');
            form.id = 'obstacle-edit-form';
            form.style.position = 'fixed';
            form.style.top = '50%';
            form.style.left = '50%';
            form.style.transform = 'translate(-50%, -50%)';
            form.style.background = '#222';
            form.style.color = '#fff';
            form.style.padding = '24px 32px';
            form.style.borderRadius = '12px';
            form.style.zIndex = 99999;
            form.style.boxShadow = '0 8px 32px #000a';

            form.innerHTML = `
                <h3 style="margin-top:0;">Edit obstacle</h3>
                <div>
                    <label>scale.x: </label>
                    <input id="edit-scale-x" type="number" min="1" step="1" value="${this.scale.x}" style="width:60px;">
                    <label>scale.y: </label>
                    <input id="edit-scale-y" type="number" min="1" step="1" value="${this.scale.y}" style="width:60px;">
                </div>
                <div style="margin-top:10px;">
                    <label>flip.x: </label>
                    <select id="edit-flip-x">
                        <option value="1" ${this.flip.x == 1 ? 'selected' : ''}>1</option>
                        <option value="-1" ${this.flip.x == -1 ? 'selected' : ''}>-1</option>
                    </select>
                    <label>flip.y: </label>
                    <select id="edit-flip-y">
                        <option value="1" ${this.flip.y == 1 ? 'selected' : ''}>1</option>
                        <option value="-1" ${this.flip.y == -1 ? 'selected' : ''}>-1</option>
                    </select>
                </div>
                <div style="margin-top:18px;text-align:right;">
                    <button id="edit-obstacle-apply" style="padding:6px 18px;">Apply</button>
                    <button id="edit-obstacle-cancel" style="padding:6px 18px;margin-left:8px;">Cancel</button>
                </div>
            `;

            document.body.appendChild(form);

            // Apply
            document.getElementById('edit-obstacle-apply').onclick = () => {
                var scaleX = parseInt(document.getElementById('edit-scale-x').value, 10);
                var scaleY = parseInt(document.getElementById('edit-scale-y').value, 10);
                if (isNaN(scaleX) || scaleX < 1) scaleX = 1;
                if (isNaN(scaleY) || scaleY < 1) scaleY = 1;
                this.scale.x = scaleX;
                this.scale.y = scaleY;
                this.flip.x = parseInt(document.getElementById('edit-flip-x').value, 10);
                this.flip.y = parseInt(document.getElementById('edit-flip-y').value, 10);
                this.setupObstacle();
                form.remove();
            };

            // Cancel
            document.getElementById('edit-obstacle-cancel').onclick = () => {
                form.remove();
            };
        },
    });

    EntityGate.inject({
        update: function() {
            this.parent();
            
            if(ig.game.editorMode) {
                if(this.underPointer()) {
                    if(ig.input.pressed('click') && !ig.game.draggingObs) {
                        ig.game.draggingObs = this;
                    }
                    if(ig.input.pressed('rClick')) {
                        this.showEditForm();
                    }
                    if(ig.input.pressed('delete')) {
                        ig.game.draggingObs = null;                        
                        this.kill();
                    }
                }

                if(ig.game.draggingObs == this) {
                    this.dragging();
                    if(ig.input.released('click')) {
                        ig.game.draggingObs = null;                        
                    }
                }
            }
        },
        showEditForm: function() {
            var oldForm = document.getElementById('obstacle-edit-form');
            if (oldForm) oldForm.remove();

            // form
            var form = document.createElement('div');
            form.id = 'obstacle-edit-form';
            form.style.position = 'fixed';
            form.style.top = '50%';
            form.style.left = '50%';
            form.style.transform = 'translate(-50%, -50%)';
            form.style.background = '#222';
            form.style.color = '#fff';
            form.style.padding = '24px 32px';
            form.style.borderRadius = '12px';
            form.style.zIndex = 99999;
            form.style.boxShadow = '0 8px 32px #000a';

            form.innerHTML = `
                <h3 style="margin-top:0;">Edit gate</h3>
                <div>
                    <label>size.x: </label>
                    <input id="edit-size-x" type="number" min="200" step="200" value="${this.size.x}" style="width:60px;">
                    <label>size.y: </label>
                    <input id="edit-size-y" type="number" min="200" step="200" value="${this.size.y}" style="width:60px;">
                </div>
                <div style="margin-top:18px;text-align:right;">
                    <button id="edit-gate-apply" style="padding:6px 18px;">Apply</button>
                    <button id="edit-gate-cancel" style="padding:6px 18px;margin-left:8px;">Cancel</button>
                </div>
            `;

            document.body.appendChild(form);

            // Apply
            document.getElementById('edit-gate-apply').onclick = () => {
                var sizeX = parseInt(document.getElementById('edit-size-x').value, 10);
                var sizeY = parseInt(document.getElementById('edit-size-y').value, 10);
                // Snap to nearest 200
                sizeX = Math.max(200, Math.round(sizeX / 200) * 200);
                sizeY = Math.max(200, Math.round(sizeY / 200) * 200);
                this.size.x = sizeX;
                this.size.y = sizeY;
                this.center = {
                    x: this.size.x / 2,
                    y: this.size.y / 2
                };
                this.particleSpawnRadius = Math.max(this.size.x, this.size.y) / 2 + 40;
                this.spawnParticles();
                form.remove();
            };

            // Cancel
            document.getElementById('edit-gate-cancel').onclick = () => {
                form.remove();
            };
        },
    });
});