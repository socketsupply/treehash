// these functions borrowed from the first time I wrote this module
// https://github.com/dominictarr/tree-exchange/blob/master/util.js
// (but did not put into production)

// height(n): count the factors of two in this number.
// this gives the height of that branch in the tree.
// odd numbers are always leaves,
// even numbers are branches.
// 2 is an even number, it represents a branch
// 2's branch is one level above the leaves, because 2/2 is odd
// 4 is a 2nd level branch, because 4 / 2 is still even.

//oh evenness is the same idea as height
function height (n) {
  var i = 0
  while(n && (n & 1) == 0) {
    i ++
    n >>= 1
  }
  return i
}
var evenness = height


//find the base of the whole tree
function root (length) {
  return collect_branch(1, length, true)
}

function start (branch) {
  return branch - (1 << height(branch)) + 1
}

function end (branch) {
  return branch + (1 << height(branch)) - 1
}

/*
  methods to gather the branches/leaves required to make a proof

  collect branch finds the highest branch within a range for one step of the proof.
  if include_end == true, then any trailing hashes are promoted.
  I expect the usual case is streaming files to the end, so this will be the usual case.

  but sometimes you want to seek within files, so you need a proof of the start.
*/

function collect_branch (start, max, include_end) {
  var _start
  var h = 0
  while((height(start) == h) && start <= max && (include_end ? true : max >= end(start))) {
    _start = start
    start += (1 << h)
    h ++
  }
  
  return _start
}

function collect_end (start, max) {
  var a = []
  while(start <= max) {
    var b = collect_branch(start, max, true)
    a.push(b)
    //get the next item
    start = end(b) + 2 // + (1 << u.evenness(b)) + 1 
  }
  return a
}

function collect (start, max) {
  var a = []
  while(start <= max) {
    var b = collect_branch(start, max, false)
    a.push(b)
    //get the next item
    start = end(b) + 2// + (1 << u.evenness(b)) + 1
  }
  return a
}


module.exports = { /*uncles, */root, height, evenness, start, end, collect, collect_end}