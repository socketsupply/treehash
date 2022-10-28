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
/*
function height (n) {
  var f = 0
  if(n == 0) return 0 //or -1 ???
  while(!(n & 1)) {
    f++; n = n >> 1
  }
  return f
}*/
//oh evenness is the same idea as height
function evenness (n) {
  var i = 0
  while(n && (n & 1) == 0) {
    i ++
    n >>= 1
  }
  return i
}

var height = evenness

function rootIndex (length) {
  var i = 1
  length --
  if(length < 0) return 0
  while(length >>= 1) i <<= 1
  return i
}

function firstChild (n) {
  if(n%2) return n
  var d = 1 << (height(n) - 1)
  return n - d
}

function belongs (n) {
  n = +n
  var d = 1 << height(n)
  //handle powers of 2
  if(n - d === 0) return n << 1
  return height(n - d) < height(n + d) ? n - d : n + d
}

function father (i, l) {
  var j = belongs(i)
  while(j >= l) {
    j = belongs(j)
  }
  return j
}

function brother (i, j, l) {
  var generation = 1 << (height(j) - 1)
  var other = j < i ? j - generation : j + generation
  while(other >= l) {
    other = firstChild(other)
  }
  return other
}


function uncles (l, i) {
  var uncles = []
  var j
  var root = rootIndex(l)
  if(!root) return []
  while(i !== root) {
    uncles.push(brother(i, j = father(i, l), l))
    i = j
  }
  return uncles
}

function start (branch) {
  return branch - (1 << height(branch)) + 1
}

function end (branch) {
  return branch + (1 << height(branch)) - 1
}

module.exports = { uncles, rootIndex, height, evenness, start, end}