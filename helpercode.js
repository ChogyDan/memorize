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
var second = 1000;
var minute = 60*second;
var hour = 60*minute;
var day = 24*hour;
var intervals = [10*second, 30*second, 10*minute, hour, 10*hour, 20*hour, 2*day];
function formatInterval(ms) {
  var number = ms/1000;
  var label = " second";
  if(number > 120) {
    number /= 60.0;
    label = " minute";
    if(number > 120) {
      number /= 60.0;
      label = " hour";     
      if(number > 48) {
        number /= 24.0;
        label = " day";
      }
    }
  }
  return number.toFixed(1) + label;

}

function InstanceOfMemorization (title, text, structure, buttonsNotText) {

  this.title = title;
  this.text = text;
  this.testType = structure;
  this.buttonsNotText = buttonsNotText;
  this.lastWorked = Date.now();
  this.internalTime = 0;
  this.internalTimeTested = [];
  this.internalTimeInterval = [];
  //*** begin strategy rethink
  this.level = []; //"level" corresponds to the interval that will be used
  this.timeLastTested = [];
  this.repeat = [];
  this.userSelectedStart = 0;//where the user would like to start memorizing
  var startingTimeStamp = Date.now() - intervals[0];
  for (var i = 0; i < this.text.length; i++) {
    this.level.push(0.0);
    this.timeLastTested.push(0);
    this.internalTimeTested.push(-1); //-1 is treated as never asked
    this.internalTimeInterval.push(1); //an interval of 1 means an adjecent question, so kinda like zero
    this.repeat.push(0);
  };

  setupIOMFunctions(this);

  addNewMem(this);

}

function setupIOMFunctions (IOM) {
  IOM.nextItem = _nextItem;
  IOM.readyToTest = _readyToTest;
  IOM.registerResult = _registerResult;
  IOM.getIntervalOf = _getIntervalOf;
  IOM.getTargetIntervalOf = _getTargetIntervalOf;
  IOM.getAdjustedTargetIntervalOf = _getAdjustedTargetIntervalOf;
}

/* old functional functions that are currently unused
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
}*/

_readyToTest = function(line) {
  if(this.timeLastTested[line] == 0) {
    return true
  }
  return intervals[Math.floor(this.level[line])] < Date.now() - this.timeLastTested[line];
}


_nextItem = function(start, end) {
  if(start == end) return start; //needed so below logic doesn't have to handle this situation
  var newInternalVariance, newVariance;
  var time, bi, internal, none, bi = 0, time = 1, internal = 2, none = 3;
  var index, timeVar, internalVar, index = 0, timeVar=1, internalVar=2;
  var results = [[-1,0,1],[-1,0,1],[-1,0,1],[-1,0,1]];

  for (var g = start; g < end+1; g++) {
    newInternalVariance = this.internalTime - this.internalTimeTested[g] - _.max([0, this.internalTimeInterval[g] - this.repeat[g]]);
    newVariance = Date.now() - this.timeLastTested[g] - this.getAdjustedTargetIntervalOf(g); 
    //console.log("this.internalTime: "+this.internalTime + " this.internalTimeTested: " + this.internalTimeTested[g]);
    //console.log("#" + g + " time var: " + newVariance + " internal var: " + newInternalVariance + " absolute internal: " + this.internalTimeInterval[g]);
    if(newVariance >= 0 && newInternalVariance >= 0){ //this means 'g' is ready to be tested from an external
                                                    // time and internal time perspective.
      if(newInternalVariance < results[bi][internalVar] || results[bi][index] == -1){
        results[bi][index] = biCandidate = g;
        results[bi][timeVar] = biVariance = newVariance;
        results[bi][internalVar] = biInternalVariance = newInternalVariance;
      }
    }
    if(newVariance >= 0 && newInternalVariance < 0) {
      if(newInternalVariance > results[time][internalVar] || results[time][index] == -1){
        results[time][index] =  g;
        results[time][timeVar] =  newVariance;
        results[time][internalVar] =  newInternalVariance;
      }
    }
    if(newInternalVariance >= 0 && newVariance < 0) {
      if(newInternalVariance < results[internal][internalVar] || results[internal][index] == -1){
        results[internal][index] =  g;
        results[internal][timeVar] =  newVariance;
        results[internal][internalVar] =  newInternalVariance;
      }
    }
    if(true) {
      if(newInternalVariance > results[none][internalVar] || results[none][index] == -1){
        results[none][index] =  g;
        results[none][timeVar] =  newVariance;
        results[none][internalVar] =  newInternalVariance;
      }
    }
  };

  if(results[bi][index] != -1){
    //console.log("bicandidate found! " + results[bi]);
    return results[bi][index];
  } else if (results[internal][index] != -1) {
    //console.log("time candidate found! " + results[time]);
    return results[internal][index];
  } else if (results[time][index] != -1) {
    //console.log("internal candidate found! " + results[internal]);
    return results[time][index] ;
  } else {
    //console.log("none found! " + results[none]);
    return results[none][index] ;
  }
}

_registerResult = function(line, time, score) {
  var timeIntervalBeaten = this.getIntervalOf(line) > this.getTargetIntervalOf(line);
  var internalTimeIntervalBeaten = this.internalTimeInterval[line] <= this.internalTime - this.internalTimeTested[line];
  this.timeLastTested[line] = time;
  this.internalTimeTested[line] = this.internalTime;
  this.internalTime += 1;
  this.repeat[line] += score;
  if(this.repeat[line] == 0) {
    if(timeIntervalBeaten){
      this.level[line] += 1;
    }
    if(internalTimeIntervalBeaten) {
      this.internalTimeInterval[line] = this.internalTimeInterval[line] + 1;
    }
  } else {
    this.repeat[line] -= 1;
  }
  console.log(this.internalTimeInterval[line]+ " is the internal interval of line " + line + " with a time intervel level of " + this.level[line]);
}

_getIntervalOf = function(line) {
  if(this.timeLastTested[line] == 0) {
    return "never";
  }
  return Date.now() - this.timeLastTested[line];
}

_getTargetIntervalOf = function(line) {
  return intervals[Math.floor(this.level[line])];
}

_getAdjustedTargetIntervalOf = function(line) {
  var intervalIndex = Math.floor(this.level[line]-this.repeat[line]);
  if(intervalIndex < 0) intervalIndex = 0;
  return intervals[intervalIndex];
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

function generateChoices(answer, displayedBottom, displayedTop, sectionBottom, sectionTop, textLength) {
  //console.log("answer, displayedBottom, displayedTop, sectionBottom, sectionTop, textLength: "+ answer + " " + displayedBottom + " " + displayedTop + " " + sectionBottom + " " + sectionTop + " " + textLength);
  var size = 4;
  var spreadIncrease = 2;// amount to increase the spread of selected elements.  Makes it more random
  if( textLength < size ) {
    console.log("WARNING: small text detected.  This isn't handled, sorry.");
    return [answer,answer,answer,answer];
  }
  var candidates = [], deferred = [];
  for ( var up = answer+1, down = answer-1; candidates.length < size-1+spreadIncrease; up++, down-- ) {
    if(up < textLength) {
      if(up >= displayedTop && up < sectionTop){
        candidates.push(up);
      } else {
        deferred.push(up);
      }
    }
    if( down >= 0 ) { 
      if(down < displayedBottom && down >= sectionBottom) {
        candidates.push(down);
      } else {
        deferred.push(down);
      }
    }
    if( up >= sectionTop && down < sectionBottom ) {
      if( deferred.length > 0 ){
        candidates.push(deferred.shift());
      } else {
        if( candidates.length >= size-1 ){
          break;
        }
        candidates.push(candidates[1]); //if the text is small enough that even deferred[] doesn't have enough elements,just repeat one of them
        console.log("WARNING: repeating answer choices.  Text size must be not much larger than what is already being displayed.");
      }
    }
  };
  candidates = _.sample(candidates,3);
  candidates.push(answer);
  return _.shuffle(candidates);
}

//SCORING
function scoreInternalTimeInterval(desiredInterval, currentTime, lastTestTime) {

}

function scoreTimeInterval(desiredInterval, currentTime, lastTestTime) {

}

function scoreProximity(location, locationTestHistory){
  
}