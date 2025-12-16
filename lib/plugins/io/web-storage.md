# WebStorage 1.0.0
Used for writing storage data in namespace style. So that each game will have only one keyname registered.

- dive into selected namespace member to begin playing with working data
- commit and rollback process to avoid mistake
---
## Dependency

- fake-storage.js

---
## Casual vs Namespace storage
- Casual style
```javascript
//Storage root
{
    myStorage-score-current: 10,
    myStorage-score-high: 15,
    myStorage-volume-bgm: 0.5, 
    myStorage-volume-sfx: 1
}
```
- Namespace style
```javascript
//Storage root
{myStorage: {score: {current: 10, high: 15}, volume:{bgm: 0.5, sfx: 1}}}
```
---
## Data structure
    storageRoot
    |->
        namespace
        |->
            dive
            |->
                collection1
                |-> value
                collection2
                |->
                    key  
                    |->
                        value
---
## How to use
1. Instantiate
```javascript
var myStorage = new WebStorage({
    collection: 'score', //string. mandatory
    namespace: 'myStorage', //string. optional
    dive: ['parent'], //string[]. optional
});
```
2. Inherit
```javascript
//-------------
//Inside module
//-------------
ig.module('my-storage').requires('plugins.io.web-storage').defines(function(){
    MyStorage = ws.extend({
        collection: 'score', //string. mandatory
        namespace:'myStorage', //string. optional
        dive: ['parent'], //string[]. optional
        init: function(){
            this.parent();
            // do your data preparation
            // you can also inherit without overiding this init function. it will atuomatically
            // use your provided collection, namespace, dive
            // nb: property "collection" is mandatory
        },
        //Do custom data handling. Avoid complicated overiding
    });
});

//-------------
//When used
//-------------
var myStorage = new MyStorage();
//Let's call your custom data handling... 
```
---
## Initial parameter
- namespace
```javascript
//Root of the game data
//type: String [optional]
//e.g: 
namespace = "myGame"
//The data structure will looks like this
{
    "myGame": theCollection // Collection cannot be used unless you have specify its name. see next...
}
//nb: namespace value is already set on plugin (modify it by your self). 
//Its okay, but please avoid using several namespace on the game.
```
- collection
```javascript
//Current scope of the data
//type: String [mandatory]
//e.g: 
collection = "myCollection"
//The data structure will looks like this
{
    "myGame": {
        "myCollection": workingData // Current scope of the data
    }
}
```
- dive
```javascript
//Parent scope of the data
//type: String Array [optional]
//e.g:
dive = ["parentA", "parentB"] 
collection = "myCollection"
//The data structure will looks like this
{
    "myGame"::{
        "parentA": { //First dive (parent)
            "parentB": { //Second dive (parent)
                "myCollection": workingData //Current scope of the data
            }
        }
    }
}
```
---
## Public properties
|Property|Description|
| ------ | ------ |
| namespace | Root name / key of the game |
| collection | Name / key of working data |
| globalData | All data available on current namespace. Storage will represent this data, after commit |
| tempData | All data available on current collection. The working data |
| prevData | globalData before next commit. Used for rollback |
| dive | Parents key of working data. Dive doesn't represent data, its just parent keys in string array |

## Public methods
- set(value, key)
```javascript
//@desc Set value to the scope.
//@paramter{value} any: the data asigned
//@parameter{key} [string]: Create child with defined key name
//@return this
//---------------

var ws = new WebStorage({collection: "score", namespace: "myNameSpace"});

var data = ws.set(10, "current").commit().get("current");
//data = 10
//storage = {"myNameSpace":{"score":{"current":10}}}

var data = ws.set(5, "current").commit().get();
//data = {"current": 5}
//storage = {"myNameSpace":{"score":{"current":5}}}

var data = ws.set(20).commit().get();
//data = 20
//storage = {"myNameSpace":{"score":20}}

//---------------
//You can skip commit, so that the data is not saved to the storage
```
- setInit(value, key)
```javascript
//@desc Set initial value. Won't replace available data
//@paramter{value} any: the data asigned
//@parameter{key} [string]: Create child with defined key name
//@return this
//---------------

//Consider current scoreInit is not available in the storage
var ws = new WebStorage({collection: "scoreInit", namespace: "myNameSpace"});

var data = ws.setInit(10, "current").commit().get("current");
//data = 10. 
//storage = {"myNameSpace":{"scoreInit":{"current":10}}}

var data = ws.setInit(5, "current").commit().get();
//data = {"current": 10}
//storage = {"myNameSpace":{"scoreInit":{"current":10}}}

var data = ws.setInit(15).commit().get();
//data = {"current": 10}
//storage = {"myNameSpace":{"scoreInit":{"current":10}}}

//---------------
//You can skip commit, so that the data is not saved to the storage
```
- setHighest(value, key)
```javascript
//@desc Compare current value with previous one. One with higher number will be used
//@paramter{value} number: value in number
//@parameter{key} [string]: Create child with defined key name
//@return this
//---------------

//Consider highest score is 0
var ws = new WebStorage({collection: "score", namespace: "myNameSpace"});
ws.setInit(0, "high").commit();// incase there is no data "high" at the begining

var data = ws.setHighest(20, "high").commit().get("high");
//data = 20. 
//storage = {"myNameSpace":{"score":{"high":20}}}

var data = ws.setHighest(5, "high").commit().get();
//data = {"high": 20}
//storage = {"myNameSpace":{"score":{"high":20}}}

var data = ws.setHighest(30).commit().get();
//data = 30
//storage = {"myNameSpace":{"score":30}}

//---------------
//You can skip commit, so that the data is not saved to the storage
```
- isSet(key)
```javascript
//@desc Check if data has been set
//@parameter{key} [string]: Get child data instead of collection data
//@return boolean
//---------------

var ws = new WebStorage({collection: "score", namespace: "myNameSpace"});
ws.set(1, "current").commit();
//storage = {"myNameSpace":{"score":{"current": 1}}}

data = ws.isSet("current");
//data = true

data = ws.isSet("unknown");
//data = false

//---------------
//You can skip commit, so that the data is not saved to the storage
```
- get(key)
```javascript
//@desc Get the data of current collection
//@parameter{key} [string]: Check child data instead of collection data
//@return any
//@return this
//---------------

var ws = new WebStorage({collection: "score", namespace: "myNameSpace"});
ws.set(10, "current").set(12, "high").commit();
//storage = {"myNameSpace":{"score":{"current": 10, "high":12}}}

data = ws.get();
//data = {"current": 10, "high": 12}

data = ws.get("current")
//data = 10

data = ws.get("unknown");
//data = undefined
```
- getInt(key)
```javascript
//@desc Get the data of current collection in integer format
//@parameter{key} [string]: Get child data instead of collection data
//@return integer
//---------------

var ws = new WebStorage({collection: "score", namespace: "myNameSpace"});
ws.set('001', "current").commit();
//storage = {"myNameSpace":{"score":{"current": '001'}}}

data = ws.getInt("current");
//data = 1

//---------------
//You can skip commit, so that the data is not saved to the storage
```
- getFloat(key)
```javascript
//@desc Get the data of current collection in floating number format
//@parameter{key} [string]: Get child data instead of collection data
//@return float
//---------------

var ws = new WebStorage({collection: "score", namespace: "myNameSpace"});
ws.set('001.14', "current").commit();
//storage = {"myNameSpace":{"score":{"current": '001.14'}}}

data = ws.getFloat("current");
//data = 1.14

//---------------
//You can skip commit, so that the data is not saved to the storage
```
- unset(key)
```javascript
//@desc Delete the current collection
//@parameter{key} [string]: Unset child data instead of the collection data
//@return this
//---------------

var ws = new WebStorage({collection: "score", namespace: "myNameSpace"});
data = ws.set(10, "current").set(12, "high").commit().get("current");
//data = 10
//storage = {"myNameSpace":{"score":{"current": 10, "high":12}}}

data = ws.unset("current").commit().get("current");
//data = undefined
//storage = {"myNameSpace":{"score":{"high":12}}}

data = ws.unset().commit().get();
//data = undefined
//storage = {"myNameSpace":{}}}

//---------------
//You can skip commit, so that the data is not saved to the storage
```
- clear()
```javascript
//@desc Delete all data on storage
//@return this
//---------------

var ws = new WebStorage({collection: "score", namespace: "myNameSpace"});
data = ws.set(10, "current").set(12, "high").commit().get("current");
//data = 10
//storage = {"myNameSpace":{"score":{"current": 10, "high":12}}}

data = ws.clear().commit().get();
//data = undefined
//storage = {}

//---------------
//You can skip commit, so that the data is not saved to the storage
```
- commit()
```javascript
//@desc Run this when the data has been set. and ready to be saved into the storage
//@return this
//---------------

var ws = new WebStorage({collection: "score", namespace: "myNameSpace"});
data = ws.set(10, "current").set(12, "high").commit().get();
//data = {"current": 10, "high": 12}
//storage = {"myNameSpace":{"score":{"current": 10, "high":12}}}

data = ws.set(2, "current").get();
//data = {"current": 2, "high": 12}
//storage = {"myNameSpace":{"score":{"current": 10, "high":12}}}

ws.commit();
//storage = {"myNameSpace":{"score":{"current": 2, "high":12}}}

//---------------
//You can skip commit, so that the data is not saved to the storage
```
- rollback()
```javascript
//@desc Run this when need to revert data. The data state will be same as before doing commit
//@return this
//---------------

var ws = new WebStorage({collection: "score", namespace: "myNameSpace"});
data = ws.set(10, "current").set(12, "high").commit().get();
//data = {"current": 10, "high": 12}
//storage = {"myNameSpace":{"score":{"current": 10, "high":12}}}

data = ws.set(2, "current").get();
//data = {"current": 2, "high": 12}
//storage = {"myNameSpace":{"score":{"current": 10, "high":12}}}

data = ws.rollback().get();
//data = {"current": 10, "high": 12}
//storage = {"myNameSpace":{"score":{"current": 10, "high":12}}}
```
---
## Testing
```javascript
//Include 'plugins.io.web-storage' in your main.js. Then run testing code via browser console

console.log('-------Begin test 1------');
//Clear previous collection
var ws = new WebStorage({namespace: 'web-storage',collection: 'unitesting',});
ws.clear().commit();
var data, tempData, globalData;

console.group('Initiation');

    console.group('Should create empty data if its not use dive');
        ws = new WebStorage({
            namespace: 'web-storage',
            collection: 'unit-test-1'
        });
        console.assert(ws.get() === undefined);//should no data
        console.assert(ws._isEmptyObject(ws.tempData));//should empty working data
        console.assert(ws._isEmptyObject(ws.globalData));//should empty
    console.groupEnd();
    //Lest save previous data
    ws.set(1).commit();
    console.group("Using dive");
        console.group("Should force simple dive into an object");
            //Re initiate new web storage
            ws = new WebStorage({
                namespace: 'web-storage',
                collection: 'unit-test-2',
                dive: ['unit-test-1']
            });
            //Previous storage {"web-storage": {"unit-test-1":1}}
            //this will prepare {"web-storage": {"unit-test-1":{}}}. Replacing data 1 on previously state
            //However it won't create 'web-storage'->'unit-test-1'->'unit-test-2' scope until saving a new data into it

            console.assert(ws.get() === undefined);//should no data since 'unit-test-2' has no any data

            console.assert(ws._isEmptyObject(ws.tempData));//'unit-test-1' is force to be empty {}

            //however 'web-storage' now has member 'unit-test-1' which is empty object
            //'web-storage'->'unit-test-1'->{} or {"web-storage": {"unit-test-1":{}}
            console.assert(ws.globalData['unit-test-1']);

            //Since ws still connected to 'unit-test-2' so lets test input value in it, at this time we insert {"key": 2}
            ws.set(2, 'key').commit();

            //Now the data become {"web-storage": {"unit-test-1": {"unit-test-2" :{"key": 2}}
            console.assert(ws.get('key') === 2);
        console.groupEnd();

        console.group("Should use previous dive object");
            ws = new WebStorage({
                namespace: 'web-storage',
                collection: 'unit-test-3',
                dive: ['unit-test-1', 'unit-test-2']
            });
            //previous storage {"web-storage": {"unit-test-1": {"unit-test-2" :{"key": 2}}
            console.assert(ws.get() === undefined);//should no data since 'unit-test-3' has no any data
            console.assert(ws.tempData['key'] === 2);//Temp data is on "unit-test-2" which has previous data {"key": 2}
            console.assert(ws.globalData['unit-test-1']['unit-test-2']['key'] === 2);//As well as the namesapce is not empty
        console.groupEnd();

        console.group("Should not able to overide dive object which has previous data");
            ws = new WebStorage({
                namespace: 'web-storage',
                collection: 'unit-test-3',
                dive: ['unit-test-1', 'unit-test-2']
            });
            data = ws.set(25).commit().get();
            console.assert(data === 25);//should have single value
            
            //Temp data is on "unit-test-2" which has previous data {"key": 2} is not deleted
            console.assert(ws.tempData['key'] === 2);

            console.assert(ws.tempData['unit-test-3'] === 25);//since working data is on 'unit-test-3'
        console.groupEnd();

    console.groupEnd();

console.groupEnd();

console.group('Get data');

    //Pervious storage is
    //{"web-storage":{"unit-test-1":{"unit-test-2":{"key":2,"unit-test-3":25}}}}

    console.group("Casual get (non dive)");
        ws = new WebStorage({namespace: "web-storage", collection: "unit-test-2"});
        data = ws.get();
        console.assert(data === undefined);

        ws = new WebStorage({namespace: "web-storage", collection: "unit-test-1"});
        data = ws.get();
        console.assert(typeof(data) === 'object');
        console.assert(typeof(data['unit-test-2']) === 'object');
        console.assert(typeof(data['unit-test-2']['key']) !== 'object');
        console.assert(typeof(data['unit-test-2']['unit-test-3']) !== 'object');
        console.assert(data['unit-test-2']['key'] === 2);
        console.assert(data['unit-test-2']['unit-test-3'] === 25);
    console.groupEnd();

    console.group("Casual get (with dive)");
        ws = new WebStorage({namespace: "web-storage", collection: "unit-test-3", dive:['unit-test-1']});
        data = ws.get();
        console.assert(data === undefined);

        ws = new WebStorage({namespace: "web-storage", collection: "unit-test-2", dive:['unit-test-1']});
        data = ws.get();
        console.assert(typeof(data) === 'object');
        console.assert(typeof(data['unit-test-3']) !== 'object');
        console.assert(typeof(data['key']) !== 'object');
        console.assert(data['key'] === 2);
        console.assert(data['unit-test-3'] === 25);
    console.groupEnd();

    console.group("Get key (no dive)");
        ws = new WebStorage({namespace: "web-storage", collection: "unit-test-1"});
        data = ws.get('unit-test-2');
        console.assert(data['key'] === 2);
        console.assert(data['unit-test-3'] === 25);
    console.groupEnd();

    console.group("Get key (with dive)");
        ws = new WebStorage({namespace: "web-storage", collection: "unit-test-2", dive:['unit-test-1']});
        console.assert(ws.get('key') === 2);
        console.assert(ws.get('unit-test-3') === 25);
    console.groupEnd();

    console.group("Get integer");
        ws = new WebStorage({namespace: "web-storage", collection: "unit-test-2", dive:['unit-test-1']});
        data = ws.set('005510AS', 'key').getInt('key');
        console.assert(data === 5510);
    console.groupEnd();

    console.group("Get float");
        ws = new WebStorage({namespace: "web-storage", collection: "unit-test-2", dive:['unit-test-1']});
        data = ws.set('00.0524sdf', 'key').getFloat('key');
        console.assert(data === 0.0524);
    console.groupEnd();

    console.group("Get bool");
        ws = new WebStorage({namespace: "web-storage", collection: "unit-test-2", dive:['unit-test-1']});
        data = ws.set(true, 'data-true').getBool('data-true');
        console.assert(data);
        data = ws.set(false, 'data-false').getBool('data-false');
        console.assert(!data);
        ws.commit();
    console.groupEnd();

console.groupEnd();

console.group('Set data');
    //Latest data is
    //{"unit-test-1":{"unit-test-2":{"key":2,"unit-test-3":25,"data-true":true,"data-false":false}}}

    console.group('Set init');
        ws = new WebStorage({namespace: "web-storage", collection: "score", dive:['unit-test-1']});
        //Set with key
        data = ws.setInit(10, "current").get();
        console.assert(data.current === 10);
        //This cannot set other high with set init
        data = ws.setInit(20, "current").get();
        console.assert(data.current === 10);
        //This also cannot force available object to be simple object
        //Set without key
        data = ws.setInit(20).get();
        console.assert(data.current === 10);
        ws.commit();
    console.groupEnd();

    console.group('Set highest');
        ws = new WebStorage({namespace: "web-storage", collection: "score", dive:['unit-test-1']});
        var score = ws.get('current');
        console.assert(score === 10);
        //First init the lowest value
        console.assert(ws.setInit(0, 'high').get('high') === 0);
        data = ws.setHighest(25, 'high').get('high');
        console.assert(data === 25);
        data = ws.setHighest(20, 'high').get('high');
        console.assert(data === 25);
        data = ws.setHighest(30, 'high').get('high');
        console.assert(data === 30);
        ws.commit();
    console.groupEnd();

console.groupEnd();

console.group('Storage modify');
    //latest stroage is
    //{"unit-test-1":{"unit-test-2":{"key":2,"unit-test-3":25,"data-true":true,"data-false":false},"score":{"current":10,"high":30}}}
    console.group("Commit");
        ws = new WebStorage({namespace: "web-storage", collection: "score", dive:['unit-test-1']});
        ws.set(60, 'coins').commit();
        ws = new WebStorage({namespace: "web-storage", collection: "score", dive:['unit-test-1']});
        data = ws.get('coins');
        console.assert(data === 60);
    console.groupEnd();

    console.group("Rollback");
        ws = new WebStorage({namespace: "web-storage", collection: "score", dive:['unit-test-1']});
        data = ws.set(70, 'coins').get('coins');
        console.assert(data === 70);
        data = ws.rollback().get('coins');
        console.assert(data === 60);
    console.groupEnd();

console.groupEnd();

console.group("Deleteing");
    console.group("unset. delete only sepfic key or collection");
        ws = new WebStorage({namespace: "web-storage", collection: "score", dive:['unit-test-1']});
        ws.unset('coins').get('coins');
        console.assert(ws.get('coins') === undefined);
        console.assert(ws.get('current') === 10);
        ws.unset();
        console.assert(ws.get() === undefined);
    console.groupEnd();

    console.group("Clear all data on namespace");
        ws = new WebStorage({namespace: "web-storage", collection: "score", dive:['unit-test-1']});
        ws.clear();
        console.assert(ws.global === undefined);
    console.groupEnd();

console.groupEnd();
```