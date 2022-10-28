
var u = require('../util')
var test = require('tape')

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

function collect_branch (start, max, include_end) {
  var a = []
  var _start
  console.log("COLLECT_BRANCH", start, max)
  var h = 0
  while(((u.height(start) + 1) == (h + 1)) && start <= max && (include_end ? true : max >= u.end(start))) {
    console.log(".", start, u.height(start), h,
      [u.height(start) + 1, (h + 1)]
    )
    a.push(start)
    _start = start
    start += (1 << h)
    h ++
  }
  
  console.log('branch', _start, a)
  return _start
}

function collect_end (start, max) {
  var a = []
  while(start <= max) {
    var b = collect_branch(start, max, true)
    a.push(b)
    //get the next item
    start = u.end(b) + 2 // + (1 << u.evenness(b)) + 1 
  }
  return a
}

function collect (start, max) {
  var a = []
  while(start <= max) {
    var b = collect_branch(start, max, false)
    a.push(b)
    //get the next item
    start = u.end(b) + 2// + (1 << u.evenness(b)) + 1
  }
  return a
}


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

  t.end()
})