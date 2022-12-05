
var u = require('../util')
var test = require('tape')
var {collect, collect_end, next_branch, very_next_branch} = u

var u = require('../util')

//get the index of the top hash, givin a maximum leaf
test('root', function (t) {
  var inputs = [
    [1, 1],
    [3, 2],
    [7, 4],
    [5, 4],
    [9, 8],
    [11, 8],
    [13, 8],
    [15, 8]
  ]

  for(var i in inputs) {
    t.equal(u.root(inputs[i][0]), inputs[i][1])
  }

  t.end()
})


test('evenness', function (t) {

  function en (i, x) {
    t.equal(u.evenness(i), x, 'expected '+i+' to have evenness:'+x)
    t.equal(u.height(i), x, 'expected '+i+' to have height:'+x)
  }

  en(1, 0)
  en(2, 1)
  en(3, 0)
  en(4, 2)
  en(5, 0)
  en(6, 1)
  en(7, 0)
  en(8, 3)
  en(9, 0)


  t.equal(u.evenness(2), 1)
  t.equal(u.evenness(3), 0)
  t.equal(u.evenness(3), 0)


  t.end()
})

//function that returns the index of the first leaf in the branch
test('start: return first leaf in branch', function (t) {

  function st (branch, leaf) { 
    t.equal(u.start(branch), leaf, 'expected branch:'+branch+' to start at leaf:'+leaf, )
  }
  st(1, 1) //a leaf is it's own branch
  st(3, 3)

  st(2, 1) //whole pawers of 2 start at 1
  st(4, 1)
  st(8, 1)
  st(16, 1)

  st(6, 5)
  st(12, 9)
  t.end()
})

test('end: return last leaf in branch', function (t) {

  function e (branch, leaf) { 
    t.equal(u.end(branch), leaf, 'expected branch:'+branch+' to start at leaf:'+leaf, )
  }
  e(1, 1) //a leaf is it's own branch
  e(3, 3)

  e(2, 3) //whole pawers of 2 end at *2 - 1
  e(4, 7)
  e(8, 15)
  e(16, 31)

  e(6, 7) //height 1
  e(10, 11)
  e(14, 15)

  e(12, 15) //height 2 (because 12 / 2 is even)
  t.end()
})

test('collect', function (t) {
  t.deepEqual(collect_end(1, 5), [4])
  console.log('.')
  t.deepEqual(collect_end(17, 25), [24])
  t.deepEqual(collect_end(19, 25), [19, 22, 25])

  t.deepEqual(collect_end(1, 3), [2])
  
  t.deepEqual(collect(1, 5), [2, 5])
  t.deepEqual(collect(1, 5), [2, 5])
  t.deepEqual(collect(1, 5), [2, 5])
  t.deepEqual(collect(5, 7), [6])
  t.deepEqual(collect(3, 5), [3, 5])
  t.deepEqual(collect(3, 15), [3, 6, 12])

  t.deepEqual(collect(1, 3), [2])
  t.deepEqual(collect(3, 5), [3, 5])

  t.end()
})

/*
-
1
 2
3
  4
5
*/
test('very_next_branch', function (t) {
  t.equal(very_next_branch(2), 3)
  t.equal(very_next_branch(4), 6)
  t.equal(very_next_branch(6), 7)
  t.equal(very_next_branch(8), 12)
  t.equal(very_next_branch(10), 11)
  t.equal(very_next_branch(12), 14)
  t.end()
})

test('next_branch', function (t) {
  t.equal(next_branch(2, 4), 3)
  t.equal(next_branch(2, 6), 3)
  t.equal(next_branch(4, 6), 5)
  t.equal(next_branch(4, 8), 6)
  t.equal(next_branch(8, 10), 9)
  /*
  -
  1
    2
  3
      4
  5
    6
  7
        8
  9
    10
  11
---------
    12
  13
    14
  15
  */
  t.equal(next_branch(8, 12), 10)
  t.end()
})
