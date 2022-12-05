
var crypto = require('crypto')
var test = require('tape')

var TreeHashFlat = require('../flat')
var TreeHash = require('../')

var zeros = Buffer.alloc(1024*1024)

test('whole blocks, same input, TreeHashFlat matches TreeHash', function (t) {
  var th = new TreeHash()
  var thf = new TreeHashFlat()
  for(var i = 0; i < 50; i++) {
    th.update(zeros)
    thf.update(zeros)
    t.deepEqual(thf.digest(), th.digest())
  }
  t.end()
})

test('whole blocks, random input, TreeHashFlat matches TreeHash', function (t) {
  var th = new TreeHash()
  var thf = new TreeHashFlat()
  for(var i = 0; i < 50; i++) {
    var b = crypto.randomBytes(1024*1024)
    th.update(b)
    thf.update(b)
    t.deepEqual(thf.digest(), th.digest())
  }
  t.end()
})


test('partial blocks, same input, TreeHashFlat matches TreeHash', function (t) {
  var th = new TreeHash()
  var thf = new TreeHashFlat()
  for(var i = 0; i < 50; i++) {
    th.update(zeros.slice(0, 1026*16))
    thf.update(zeros.slice(0, 1026*16))
    t.deepEqual(thf.digest(), th.digest())
  }
  t.end()
})

test('random input partial blocks, TreeHashFlat matches TreeHash', function (t) {
  var th = new TreeHash()
  var thf = new TreeHashFlat()
  for(var i = 0; i < 50; i++) {
    var b = crypto.randomBytes(~~(Math.random() * (1024*1024)))
    th.update(b)
    thf.update(b)
    t.deepEqual(thf.digest(), th.digest())
  }
  t.end()
})
