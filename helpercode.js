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
  workingPossibilities = [];
  for (var i = 0; i < this.workingSet.length; i++) {
    workingItem = this.workingSet[i];
    if(time-this.lastCorrectTime[workingItem] > this.targetTime[workingItem]){
      //console.log(time-this.lastCorrectTime[workingItem] + " > " + this.targetTime[workingItem]);
      workingPossibilities.push(workingItem);
    }
  };
  console.log(workingPossibilities.length + " is the number of testable lines");
  if(workingPossibilities.length > 4) {
  	return getRandomFromArray(workingPossibilities);
  }
  newItem = this.unWorkingSet.pop();//TODO make this a bit random
  if(newItem == null) {//The content of this if is incorrect
  	alert("You are doing great! You should wait before you continue.");
  	return getRandomFromArray(this.workingSet);
  } else {
    this.workingSet.push(newItem);
  	this.lastCorrectTime[newItem] = time;
  	this.lastTestedTime[newItem] = time;
  	this.targetTime[newItem] = 0;
  	return newItem;
  }
}

_updateCorrectTime = function(line, time) {
	/*//TODO this limits target time to an increase of %20 each time you get it correct.  
	That addresses just not using the program for a few days, then coming back, gettting it right, 
	and having a huge increase in target time.  For now, this is ok.  Maybe in the future, base it
	on something else, like when the program is running?  */
	var potentialNewTarget = time - this.lastTestedTime[line];
	if (potentialNewTarget < 2*this.targetTime[line] || this.targetTime[line] < 10000) {
		this.targetTime[line] = potentialNewTarget;
	} else {
		this.targetTime[line] = 1.5*this.targetTime[line];
		console.log("time over target! " + this.targetTime[line]);
		//if (this.targetTime[line]==0) console.log("ERROR: TARGET TIME FAILURE");
	}
  this.lastCorrectTime[line] = time;
  this.lastTestedTime[line] = time;
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

function getRandomFromArray(theArray){
	var random = _.random(0, theArray.length-1);
	console.log("random is: " + random);
	return theArray[random];
}