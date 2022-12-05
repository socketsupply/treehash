var test = require('tape')
var TreeHash = require('../')
var TreeHashFlat = require('../flat')
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

/*
  branch numbering:
  leaves are odd,
  branches are even

        1
       /
      2
     / \ 
    /   3
   /
  4
   \
    ...

  the leaves are the hashes of the blocks.
  the branches are the possible tree hashes
  if we have just one block, out of 2, and we know the root hash (2)
  then having leaf hash 3 is proof that 1 is part of 2 because 2 == hash(1, 3)
  

*/
test('verify', function (t) {

  var ht = new TreeHash()
  // leaf 1, 
  // prove 1 in 2

  ht.update(zeros_1mb)
  t.deepEqual(ht.verify([hash(zeros_1mb)]), new TreeHash().update(zeros_1mb).update(zeros_1mb).digest())

  function assert_proof(preblocks, blocks, proof) {
    var th = new TreeHash()
    var th2 = new TreeHash()
    var fh = new TreeHashFlat()
    blocks.slice(0, preblocks).forEach(block => th.update(block))
    blocks.forEach(block => fh.update(block))
    var th2 = new TreeHash()
    blocks.forEach(block => th2.update(block))

    t.deepEqual(th.verify(proof), th2.digest())
    t.deepEqual(fh.proof(preblocks.length), proof)
  }

  t.deepEqual(
    new TreeHashFlat().update(zeros_1mb).update(zeros_1mb).proof(1),
    [hash(zeros_1mb)]
  )

  assert_proof(1, [zeros_1mb, zeros_1mb], [hash(zeros_1mb)])
  assert_proof(2, [zeros_1mb, zeros_1mb, zeros_1mb], [hash(zeros_1mb)])
  assert_proof(1, [zeros_1mb, zeros_1mb, zeros_1mb], [hash(zeros_1mb), hash(zeros_1mb)])
  assert_proof(1, [zeros_1mb, zeros_1mb, zeros_1mb, zeros_1mb], [hash(zeros_1mb), hash(hash(zeros_1mb), hash(zeros_1mb))])
  assert_proof(2, [zeros_1mb, zeros_1mb, zeros_1mb, zeros_1mb], [hash(hash(zeros_1mb), hash(zeros_1mb))])

  assert_proof(3, [zeros_1mb, zeros_1mb, zeros_1mb, zeros_1mb], [hash(zeros_1mb)])


  assert_proof(3, [
    zeros_1mb, zeros_1mb, zeros_1mb, zeros_1mb,
    zeros_1mb, zeros_1mb, zeros_1mb, zeros_1mb
  ], [
    hash(zeros_1mb),
    hash(hash(hash(zeros_1mb), hash(zeros_1mb)),  hash(hash(zeros_1mb), hash(zeros_1mb)))
  ])

  assert_proof(5, [
    zeros_1mb, zeros_1mb, zeros_1mb, zeros_1mb,
    zeros_1mb, zeros_1mb, zeros_1mb, zeros_1mb
  ], [
    hash(zeros_1mb),  hash(hash(zeros_1mb), hash(zeros_1mb))
  ])


  ht.update(zeros_1mb)

  //prove 2 in 3
  t.deepEqual(ht.verify([
    hash(zeros_1mb), 
  ]), new TreeHash().update(zeros_1mb).update(zeros_1mb).update(zeros_1mb).digest())

  //prove 2 in 4
  t.deepEqual(ht.verify([
    hash(hash(zeros_1mb), hash(zeros_1mb))
  ]), new TreeHash().update(zeros_1mb).update(zeros_1mb).update(zeros_1mb).update(zeros_1mb).digest())


  //prove 3 in 4
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
