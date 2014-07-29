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

function InstanceOfMemorization (title, text, structure, buttonsNotText) {

  this.title = title;
  this.text = text;
  this.testType = structure;
  this.buttonsNotText = buttonsNotText;
  this.lastWorked = Date.now();
  this.workingSet = [];
  this.unWorkingSet = [];
  for (var i = text.length -1; i >= 0; i--) {
    this.unWorkingSet.push(i);
  };
  this.lastCorrectTime = [];
  this.lastTestedTime = [];
  this.targetTime = [];
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
    if(time-this.lastCorrectTime[workingItem] > this.targetTime[workingItem]){
      //console.log(time-this.lastCorrectTime[workingItem] + " > " + this.targetTime[workingItem]);
      return workingItem;
    }
  };
  newItem = this.unWorkingSet.pop();//TODO make this a bit random
  if(newItem == null) {
  	alert("You are doing great! You need to wait before you can continue.");
  	return;
  }
  this.workingSet.push(newItem);
  this.lastCorrectTime[newItem] = Date.now();
  this.lastTestedTime[newItem] = Date.now();
  this.targetTime[newItem] = 0;
  return newItem;
}

_updateCorrectTime = function(line, time) {
  this.targetTime[line] = time - this.lastTestedTime[line];
  this.lastCorrectTime[line] = time;
  this.lastWorked = time;

}

_reduceTarget = function(line) {
  this.targetTime[line] = this.targetTime[line]*0.9;
  this.lastTestedTime[line] = Date.now();
}

function addNewMem(newMem) {
  mems = getMems();
  newMem.index = mems.length;
  mems.push(newMem);
  saveMems(mems);
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