ig.module(
    'plugins.io.fake-storage'
)
.requires(
    'impact.game'
)
.defines(function(){

ig.FakeStorage = ig.Class.extend({

	tempData: {},

    init: function(){
        ig.FakeStorage.instance = this;
    },

    initUnset: function(key, value) {
        if (this.get(key) === null) this.set(key, value);
    },

    set: function(key, value)    {
        this.tempData[key] = JSON.stringify(value);
    },

    setItem: function(key, value) {
        this.tempData[key] = JSON.stringify(value);
    }, 

    setHighest: function(key, value)    {
        if(value > this.getFloat(key)) this.set(key, value);
    },

    get: function(key)  {
		return typeof(this.tempData[key]) == "undefined" ? null : JSON.parse(this.tempData[key]);
    },
    
    getItem: function(key) {
        return typeof(this.tempData[key]) == "undefined" ? null : JSON.parse(this.tempData[key]);
    },

    getInt: function(key)   {
        return ~~this.get(key);
    },

    getFloat: function(key) {
        return parseFloat(this.get(key));
    },

    getBool: function(key)  {
        return !!this.get(key);
    },

    isSet: function(key)   {
        return !(this.get(key) === null);
    },

    remove: function(key)   {
        delete this.tempData[key];
    },

    removeItem: function(key)   {
        delete this.tempData[key];
    },

    clear: function()   {
        this.tempData = {};
    }
});

});
