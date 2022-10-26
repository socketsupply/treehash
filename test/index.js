var test = require('tape')
var TreeHash = require('../')
var naive = require('../naive')
var crypto = require('crypto')

function hash (a, b='') {
  return crypto.createHash('sha256').update(a).update(b).digest()
}

var zeros_1mb = Buffer.alloc(1024*1024).fill(0)
var vectors = [
  {
    input: 'test',
    hash: Buffer.from('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', 'hex')
  },
  {
    //on a short input, the result is just the sha256 hash
    input: 'hello world',
    hash: hash('hello world')
  },
  {
    input: Buffer.alloc(1024*1024*2).fill(0),
    hash: Buffer.from('861890b487038d840e9d71d43bbc0fd4571453fb9d9b1f370caa3582a29b0ec7', 'hex')
  },
  {
    input: Buffer.alloc(1024*1024*2).fill(0),
    hash: hash(hash(zeros_1mb), hash(zeros_1mb))
  },
  {
    //trailing blocks are promoted
    input: Buffer.alloc(1024*1024*3).fill(0),
    hash: hash(
      hash(hash(zeros_1mb), hash(zeros_1mb)),
      hash(zeros_1mb)
    )
  },
  {
    //if input is less than the block size, partical block is hashad at the end.
    input: Buffer.alloc(1024*1024*2.5).fill(0),
    hash: hash(
      hash(hash(zeros_1mb), hash(zeros_1mb)),
      hash(zeros_1mb.slice(0, 1024*1024/2))
    )
  },

]

test('naive', function (t) {
  for(var i = 0 ; i < vectors.length; i++) {
    t.deepEqual(naive(vectors[i].input), Buffer.from(vectors[i].hash, 'hex'))
  }
  t.end()

})

test('vectors', function (t) {
  for(var i = 0 ; i < vectors.length; i++) {
    t.deepEqual(new TreeHash().update(vectors[i].input).digest(), Buffer.from(vectors[i].hash, 'hex'))
  }
  t.end()
})

test('extend', function (t) {
  for(var i = 0 ; i < vectors.length; i++) {
    var {input, hash} = vectors[i]
    input = Buffer.from(input)
    var mid = 1 + ~~(Math.random()*(input.length-2))
    var th = new TreeHash
    var first = th.update(input.slice(0, mid)).digest()
    t.notDeepEqual(first, hash)
    var second = th.update(input.slice(mid)).digest()
    t.deepEqual(second, hash)
  }
  t.end()

})

test('verify', function (t) {

  var ht = new TreeHash()
  ht.update(zeros_1mb)
  t.deepEqual(ht.verify([hash(zeros_1mb)]), new TreeHash().update(zeros_1mb).update(zeros_1mb).digest())

  ht.update(zeros_1mb)
  t.deepEqual(ht.verify([
    hash(hash(zeros_1mb), hash(zeros_1mb))
  ]), new TreeHash().update(zeros_1mb).update(zeros_1mb).update(zeros_1mb).update(zeros_1mb).digest())

  ht.update(zeros_1mb)
  t.deepEqual(ht.verify([
    hash(zeros_1mb)
  ]), new TreeHash().update(zeros_1mb).update(zeros_1mb).update(zeros_1mb).update(zeros_1mb).digest())


  t.deepEqual(ht.verify([
    hash(zeros_1mb),
    hash(
      hash(hash(zeros_1mb), hash(zeros_1mb)),
      hash(hash(zeros_1mb), hash(zeros_1mb))
    )
  ]), new TreeHash()
      .update(zeros_1mb).update(zeros_1mb).update(zeros_1mb).update(zeros_1mb)
      .update(zeros_1mb).update(zeros_1mb).update(zeros_1mb).update(zeros_1mb)
    .digest())


  t.end()
})

