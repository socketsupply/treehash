

var test = require('tape')

var TreeHashFlat = require('../flat')
var TreeHash = require('../')

var zeros = Buffer.alloc(1024*1024)

test('pow of 2 size trees TreeHashFlat matches TreeHash', function (t) {
  var th = new TreeHash()
  var thf = new TreeHashFlat()
  th.update(zeros)
  thf.update(zeros)
  t.deepEqual(thf.digest(), th.digest())
  th.update(zeros)
  thf.update(zeros)
  t.deepEqual(thf.digest(), th.digest())
  th.update(zeros)
  thf.update(zeros)
  t.deepEqual(thf.digest(), th.digest())

  t.end()

})