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
var intervals = [0, 30000, 600000, 3600000, 3600000*10, 3600000*20, 3600000*40, 3600000*80];
function InstanceOfMemorization (title, text, structure, buttonsNotText) {

  this.title = title;
  this.text = text;
  this.testType = structure;
  this.buttonsNotText = buttonsNotText;
  this.lastWorked = Date.now();
  //this.prioritySet = [];
  //this.mainSet = [];
  //this.deferredSet = [];
  //this.minInterval = 2000;
  //this.maxInterval = 4000;
  //this.workingSet = [];
  //this.unWorkingSet = [];
  this.lastTestedTime = [];
  this.streak = [];
  this.buckets = [];
  for (var i = intervals.length - 1; i >= 0; i--) {
  	this.buckets.push([]);
  };
  var time = Date.now();
  for (var i = text.length -1; i >= 0; i--) {
    //this.unWorkingSet.push(i);
    //this.prioritySet.push(i);
    this.lastTestedTime.push(time-this.minInterval);
    this.streak.push(3);//starting at 3 allows for a single correct to up interval at start of memorization.  See _registerResult
    this.buckets[0].push(i);
  };
  this.lastCorrectTime = [];

  this.targetTime = [];
  setupIOMFunctions(this);

  addNewMem(this);

}

function setupIOMFunctions (IOM) {
  IOM.nextItem = _nextItem;
  //IOM.updateCorrectTime = _updateCorrectTime;
  //IOM.reduceTarget = _reduceTarget;
  //IOM.registerWrong = _registerWrong;
  //IOM.registerCorrect = _registerCorrect;
  IOM.registerResult = _registerResult;
}

/*_nextItemOLD = function() {
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
}*/

scanOverInterval = function(set, times, interval) {
	returnSet = [];
	time = Date.now();
	for (var i = 0; i < set.length; i++) {
		currentInterval = time - times[set[i]];
		if(currentInterval >= interval) {
			returnSet.push(set[i]);
		}
	};
	//console.log("scanOverInterval results");
	//console.log(returnSet);
	return returnSet;
}

samplex = function(theArray, exponent) {
	//var max = Math.sqrt(theArray.length-1);
	//var min = 0;
	randomIndex = Math.round(Math.pow(Math.random()*Math.pow(theArray.length-1,1/exponent),exponent));
	console.log("length is " + theArray.length + " and random select is " + randomIndex);
	return theArray[randomIndex];
}

samplelog = function(theArray, base) {
	//TODO: this function is wrong.  It is weighting the end where I want to weight the beginning.
	//Turns out, my input array is reversed.  So for now, it's ok, but I suspect problems will arise.
	//See here for some possible reference: http://stackoverflow.com/questions/3745760/java-generating-a-random-numbers-with-a-logarithmic-distribution
	var max = Math.pow(base, theArray.length-1);
	//var min = 1;
	var random = Math.random()*(max-1) + 1;
	var index = Math.round( Math.log(random) / Math.log(base) );
	//console.log("random is " + random + " and length is " + theArray.length + " and random select is " + index);
	return theArray[index];
}

/*_nextItemFORMERNEXT = function() {
	time = Date.now();
	//scan in this.mainSet for items which are over interval
	console.log(this.mainSet);
	testImmediately = scanOverInterval(this.mainSet, this.lastTestedTime, this.maxInterval)
	  //return one of those if one is found
	if(testImmediately.length > 0) {
		console.log("immediately");
		return _.sample(testImmediately);
	}
	//randomly choose whether to work on the priority set or the main set, taking into account the possibility that one of the sets has no possible interval based candidates
	mainCandidates = scanOverInterval(this.mainSet, this.lastTestedTime, this.minInterval);
	priorityCandidates = scanOverInterval(this.prioritySet, this.lastTestedTime, this.minInterval);
	chooseMain = _.random(1);
	if(mainCandidates.length > 0 && chooseMain) {
		console.log("main");
		return _.sample(mainCandidates)
	} else if (priorityCandidates.length > 0) {
		//TODO change this to a log2 based weighted sampling
    console.log("priority sample");
		return samplelog(priorityCandidates,2)
	} else {
		console.log("ERROR (nextItem): no candidate found.  FIXME, maybe ask a stupid question.")
		alert("Error has been encountered.  Don't worry.  You are doing quite well.  The program may not work correctly.  Try coming back later.")
		return 0;
	}
}*/

_nextItem = function() {
	time = Date.now();
	for (var i = this.buckets.length - 1; i >= 0; i--) {
		var candidates = [];
		for (var j = 0; j < this.buckets[i].length; j++) {
			if(time - this.lastTestedTime[this.buckets[i][j]] > intervals[i]) {
				candidates.push(this.buckets[i][j]);
			}
		};
		if(candidates.length > 0) {
			console.log("bucket " + i + " had " + candidates.length + " candidates!");
			return samplelog(candidates,2);
		}
	};
	console.log("ERROR: no candidate found.  Impossible!");
}


/*_registerCorrect = function(line, time) {
	this.lastTestedTime[line] = time;
	this.streak[line] += 1;
	var priorityIndex = _.indexOf(this.prioritySet, line);
	var mainIndex = _.indexOf(this.mainSet, line);
	if(priorityIndex != -1) {
		this.mainSet.push(this.prioritySet.splice(priorityIndex, 1)[0]);
		if(this.prioritySet.length == 0){
			alert("FIXME: trigger acceleration event");
		}
	} else {
		if(this.streak[line] > 2) {
			this.deferredSet.push(this.mainSet.splice(mainIndex,1)[0])
		}
	}
}*/

_registerResult = function(line, time, correct) {
	this.lastTestedTime[line] = Date.now();

	for (var i = 0; i < this.buckets.length; i++) {
		subIndex = _.indexOf(this.buckets[i], line)
		if(subIndex != -1) {
			if(correct == "correct"){
				if(this.streak[line] > 2){
			    this.buckets[Math.min(i+1,this.buckets.length-1)].push(this.buckets[i].splice(subIndex,1)[0]);
			  	//this.streak[line] -= 1;
			  	console.log("upping difficulty");
			  } else {
			  	this.streak[line] += 1;
			  }
			} else {
				if(this.streak[line] == 0) {
			    this.buckets[Math.max(i-1,0)].push(this.buckets[i].splice(subIndex,1)[0]);
			    //this.streak[line] += 1;
			    console.log("downing difficulty");
				} else {
					this.streak[line] = Math.max(this.streak[line]-2,0);
				}
			}
			break;
		}
	};
}

/*_registerWrong = function(line, time) {
	this.lastTestedTime[line] = time;
	this.streak[line] = 0;
	var mainIndex = _.indexOf(this.mainSet, line);
	if(mainIndex != -1) {
		console.log("before: main " + this.mainSet + " prioritySet " + this.prioritySet);
		this.prioritySet.push(this.mainSet.splice(mainIndex, 1)[0]);
		console.log("after: main " + this.mainSet + " prioritySet " + this.prioritySet);
	}
}*/

/*_registerWrongNEXT = function(line, time) {
	this.lastTestedTime[line] = time;
	this.streak[line] -= 1;
	for (var i = 0; i < buckets.length; i++) {
		subIndex = _.indexOf(buckets[i], line)
		if(subIndex != -1 && this.streak[line] > 2) {
			//TODO FIXME: make sure that the buckets index is inbounds
			buckets[i+1].push(buckets[i].splice(subIndex,1)[0])
			this.streak[line] -= 2;
		}
	};
}*/

/*_updateCorrectTime = function(line, time) {
	/start//TODO this limits target time to an increase of %20 each time you get it correct.  
	That addresses just not using the program for a few days, then coming back, gettting it right, 
	and having a huge increase in target time.  For now, this is ok.  Maybe in the future, base it
	on something else, like when the program is running?  star/
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

}*/

/*_reduceTarget = function(line) {
  this.targetTime[line] = this.targetTime[line]*0.9;
  this.lastTestedTime[line] = Date.now();
}*/

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

function randoms_MaxWith(max, toContain) {
	var size = 4;
	var randomsArray = [];
	var correctLocation = _.random(size-1);
	randomsArray[correctLocation] = toContain;
	for (var i = 0; i < size; i++) {
		if(i == correctLocation) {
			continue;
		}
		do {
			possibleRandom = _.random(max);
		} while (_.indexOf(randomsArray, possibleRandom) != -1)
		randomsArray[i] = possibleRandom;
	};
	//console.log("toContain is " + toContain + " and return array is " + randomsArray);
	return [randomsArray, correctLocation];
}