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


//get the index of the top hash, givin a maximum leaf
//note: can also be called with tree.length-1 because that is the maximum leaf. 
function root (last_leaf) {
  return collect_branch(1, last_leaf, true)
}

//get index of first hash under branch
function start (branch) {
  return branch - (1 << height(branch)) + 1
}

//get index of last hash under branch
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

//the next branch of our parent,
//i.e. the next branch in the tree with the same height as us.
function next_sibling (i) {
  return i + (1 << (height(i)+1))
}

function next_branch (i) {
  return i + (1 << (height(i)-1))
}

//calculate the next branch, but taking into account if the tree doesn't include it,
//and so a branch from the previous level gets promoted.
function prev_branch(i) {
  return i - (1 << height(i) - 1)
}
function next_branch_with_promotion(i, length) {
  var h = height(i)
  //if there is enough froom for the rest of the entire tree, take the next subbranch
  if(length > end(i))
    return next_branch(i)
  var t = next_branch(i)
  h--
  while(t + 1 > length) {
    h --
    t = t - (1 << h)
  }
  return t

}

function block2leaf_index (bi) {
  return 1 + bi*2
}

module.exports = { /*uncles, */root, height, evenness, start, end, collect, collect_end, next_branch_with_promotion, next_branch, prev_branch, next_sibling, block2leaf_index}