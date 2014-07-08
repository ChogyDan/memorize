function pullArrayFromLS(name) {
  if(localStorage.getItem(name)!=null) {  //localStorage returns null string if it can't find the item
      return JSON.parse(localStorage[name]); 
    } else return new Array;
}
function pushArrayToLS(variable, name){
  localStorage.setItem(name, JSON.stringify(variable));
}
function getTextArray() {
  return pullArrayFromLS('textFolderTexts'); 
}

function getTitleArray() {
  return pullArrayFromLS('textNames');
}

function saveTexts(updatedTextsArray, updatedTitlesArray) {
  pushArrayToLS(updatedTitlesArray, 'textNames');
  pushArrayToLS(updatedTextsArray, 'textFolderTexts');
}
var memorizations = pullArrayFromLS('memorizations');
function InstanceOfMemorization (title, text) {

  this.title = title;
  this.text = text;
  this.lastWorked = Date.now();
  this.workingSet = [];
  this.unWorkingSet = [];
  for (var i = 0; i < text.length; i++) {
    this.unWorkingSet.push(i);
  };
  this.lastCorrectTime = [];
  this.longest = [];
  setupIOMFunctions(this);

  addNewMem(this);

}

function setupIOMFunctions (IOM) {
  IOM.nextItem = _nextItem;
  IOM.updateCorrectTime = _updateCorrectTime;
  IOM.reduceTarget = _reduceTarget;
}

_nextItem = function() {
  time = Date.now();
  for (var i = this.workingSet.length - 1; i >= 0; i--) {
    workingItem = this.workingSet[i];
    if(time-this.lastCorrectTime[workingItem] > this.longest[workingItem]){
      console.log(time-this.lastCorrectTime[workingItem] + " > " + this.longest[workingItem]);
      return workingItem;
    }
  };
  newItem = this.unWorkingSet.pop();//TODO make this a bit random
  this.workingSet.push(newItem);
  this.lastCorrectTime[newItem] = Date.now();
  this.longest[newItem] = 0;
  return newItem;
}

_updateCorrectTime = function(line) {
  time = Date.now();
  this.longest[line] = time - this.lastCorrectTime[line];
  this.lastCorrectTime[line] = time;
  this.lastWorked = time;

}

_reduceTarget = function(line) {
  this.longest[line] = this.longest[line]*0.9;
}

function addNewMem(newMem) {
  newMem.index = memorizations.length;
  memorizations.push(newMem);
  saveMems(memorizations);
}
function getMems() {
  mems = pullArrayFromLS('memorizations');
  _.each(mems, function(mem, index, list) {
    setupIOMFunctions(mem);
  });
  return mems;
}
function saveMems(mems) {
  pushArrayToLS(mems, 'memorizations');
}

function saveMem(mem) {
  mems = getMems();
  mems[mem.index] = mem;
  saveMems(mems);
}

function removeMem(index) {
  mems = getMems();
  mems.splice(index, 1);
  saveMems(mems);
}