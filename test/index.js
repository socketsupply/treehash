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
    hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  },
  {
    //on a short input, the result is just the sha256 hash
    input: 'hello world',
    hash: hash('hello world').toString('hex')
  },
  {
    input: Buffer.alloc(1024*1024*2).fill(0),
    hash: '861890b487038d840e9d71d43bbc0fd4571453fb9d9b1f370caa3582a29b0ec7'
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