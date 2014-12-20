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
  if(number > 60) {
    number /= 60.0;
    label = " minute";
    if(number > 60) {
      number /= 60.0;
      label = " hour";     
      if(number > 24) {
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
  //*** begin strategy rethink
  this.level = []; //"level" corresponds to the interval that will be used
  this.timeLastTested = [];
  this.correctStreak = [];//track how many have been gotten correct in a row
  this.userSelectedStart = 0;//where the user would like to start memorizing
  var startingTimeStamp = Date.now() - intervals[0];
  for (var i = 0; i < this.text.length; i++) {
    this.level.push(0.0);
    this.timeLastTested.push(0);
    this.correctStreak.push(0);
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


_nextItem = function() {
  var i = parseInt(this.userSelectedStart);
  /*if(this.testMode) {
    this.userSelectedStart += 1;
    if(this.userSelectedStart == this.text.length) {
      this.userSelectedStart = 0;
    }
    return this.userSelectedStart;
  }*/
  if(i == -1) {
    var linesReadyToTest = [];
    for (var j = 0; j < this.text.length; j++) {
      if(this.readyToTest(j)) {
        linesReadyToTest.push(j);
      }
    };
    if(linesReadyToTest.length > 0) {
      return _.sample(linesReadyToTest);
    }
  }
  console.log("nextItem before while");
  while(true) {
    if(this.readyToTest(i)) {
      return i;
    }
    i++;
    console.log(i);
    if(i==this.text.length) {
      i = 0;
      console.log("wrapping in nextItem");
    }
    if(i == this.userSelectedStart) {
      break;
    }
  };
  console.log("ERROR: no candidate found.  WHAT TO DO?");
  return _.random(this.text.length-1);
}
_registerResult = function(line, time, score) {
  this.timeLastTested[line] = time;
  if(score > 0) {
    this.correctStreak[line] += 1;
  } else {
    this.correctStreak[line] = 0;
  }
  this.level[line] += _.max([0.5*score + this.correctStreak[line]*0.2,0]);
  console.log("score/level is " + this.level[line]);
}

_getIntervalOf = function(line) {
  if(this.timeLastTested[line] == 0) {
    return "never";
  }
  return formatInterval(Date.now() - this.timeLastTested[line]);
}

_getTargetIntervalOf = function(line) {
  return formatInterval( intervals[Math.floor(this.level[line])] );
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