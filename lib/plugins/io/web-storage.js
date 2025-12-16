/**
 * Used to combine data in a namespace which represents a field on the storage.
 * However you can have multiple namespace by setting namespace variable on each inherited web-storage object
 * 
 * Namespace style
 * {myStorage: {score: {current: 10, high: 15}, volume:{bgm: 0.5, sfx: 1}}}
 * 
 * Please see documentation (web-storage.md) to get more information.
 *
 * @version 1.0.0
 * 
 * @since 1.0.0
 *
 */
ig.module('plugins.io.web-storage')
.requires(
	//Other required class
	'plugins.io.fake-storage'
)
.defines(function () {
	WebStorage = ig.Class.extend({
		//Change default namespace here
		namespace:'testNameSpace',
		collection:false,
		globalData: {},
		tempData: false,
		prevData: {},
		dive: [],
        
        _castToObject: function(obj){
            var _this = this;
            obj = _this._isObject(obj) ? obj : {};
            return obj;
        },

		_isNull: function(variable){
			return (variable === null || variable === undefined);
		},

		_isObject: function(obj){
			return (!this._isNull(obj)) && (typeof obj  === "object");
		},

		_isEmptyArray: function(check){
			return !(typeof check !== undefined && check.length > 0);
		},

        //Its not actually used. just helper for duing testing.
        _isEmptyObject: function(obj){
            if (!this._isObject(obj)) return true;
            if (obj.length > 0)    return false;
            if (obj.length === 0)  return true;
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }
            return true;
        },

		_dive: function(){
			var _this = this;
			_this.tempData = _this._fetch();
			_this.prevData = ig.copy(_this.globalData);
			if(!_this._isEmptyArray(_this.dive)){
				for (var i = 0; i < _this.dive.length; i++) {
					var diveName = _this.dive[i];
                    _this.tempData[diveName] = _this._castToObject(_this.tempData[diveName]);
					_this.tempData = _this.tempData[diveName];
				}
			}
			return _this;
		},

		_fetch: function(key){
			var _this = this;

			_this.globalData = ig.game.storage.get(_this.namespace);
			if(_this._isNull(_this.globalData))
				_this.globalData = {};
			return _this.globalData;
		},

        prepareStorage: function(){
            if(!ig.game.storage){
                try {
                    var testStorage = "testStorage";
                    localStorage.setItem(testStorage, testStorage);
                    localStorage.removeItem(testStorage);
                    localStorageSupport='localStorage' in window && window['localStorage'] !== null;
                    ig.game.storage = new ig.Storage();
                } 
                catch(e){
                    ig.game.storage = new ig.FakeStorage();
                }
            }
        },

		init:function(options){
			var _this = this;
            _this.prepareStorage();
			if(_this._isObject(options)){
				_this.namespace = options.namespace || _this.namespace;
				_this.collection = options.collection || _this.collection;
				_this.dive = options.dive || _this.dive;
			}
			_this.dive = _this.dive || [];
			_this._dive();
		},

		//------Modify the storage

		commit: function(){
			var _this = this;
			_this.prevData = ig.copy(_this.globalData);
			ig.game.storage.set(_this.namespace, _this.prevData);
			_this._dive();
			return _this;
		},

		rollback: function(){
			var _this = this;
			_this.globalData = ig.copy(_this.prevData);
			ig.game.storage.set(_this.namespace, _this.globalData);
			_this._dive();
			return _this;
		},

		//------Set data

		isSet: function(key){
			var _this = this;
			if(_this._isNull(_this.tempData))
				return false;
			else if(_this._isNull(key))
				return !_this._isNull(_this.tempData[_this.collection]);
			else{
				return !(_this._isNull(_this.tempData[_this.collection]) || 
					   _this._isNull(_this.tempData[_this.collection][key]));
			}
		},

		setInit: function(value, key){
			var _this = this;
			
			var isSet = _this.isSet(key);
			if(!isSet)
				_this.set(value,key);
			return _this;
		},

		set: function(value, key){
			var _this = this;
            
			if(key === null || key === undefined)
				_this.tempData[_this.collection] = value;
			else{
                _this.tempData[_this.collection] = _this._castToObject(_this.tempData[_this.collection]);
				_this.tempData[_this.collection][key] = value;
			}
			return this;
		},

		setHighest: function(value, key){
			var _this = this;
			var previous = NaN;
			if(_this._isNull(key)){
				previous = _this.getFloat();
				if(!isNaN(previous) && value > previous)
					_this.set(value);
			}else{
				previous = _this.getFloat(key);
				if(!isNaN(previous) && value > previous)
					_this.set(value, key);
			}
			return _this;
		},

		//------Get data

		get: function(key){
			var _this = this;
			if(_this._isNull(key))
				return  _this._isNull(_this.tempData) || _this._isNull(_this.tempData[_this.collection])
						? undefined 
						: _this.tempData[_this.collection];
			else
				return 	_this._isNull(_this.tempData) ||
						_this._isNull(_this.tempData[_this.collection]) || 
						_this._isNull(_this.tempData[_this.collection][key])
						? undefined 
						: _this.tempData[_this.collection][key];
		},

		getInt: function(key){
			var _this = this;
			return parseInt(_this.get(key));
		},
		
		getFloat: function(key){
			var _this = this;
			return parseFloat(_this.get(key));
		},

		getBool: function(key){
			var _this = this;
			return !!_this.get(key);
		},

		//------Delete data

		unset: function(key){
			var _this = this;
			if(_this._isNull(_this.tempData[_this.collection]))
				return this;
			else if(_this._isNull(key))
				delete(_this.tempData[_this.collection]);
			else{
				var isSet = _this.isSet(key);
				if(isSet)
					delete(_this.tempData[_this.collection][key]);
			}
			return _this;
		},

		clear:function(){
			var _this = this;
			delete(_this.globalData);
			return _this;
		},
	});
});
