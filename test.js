var fs = require('fs')
var crypto = require('crypto')

/**
  * implements a very simple, but correct, version of the hash tree.
  * outputs all the hashes.
  * just takes the input, hashes each block
  * then hashes the hashes.
  * key detail: if there is an odd number of hashes in a tree level
  * the last hash is copied to the next level without hashing it again.
  */

function hash (a, b = '') {
  var h = crypto.createHash('sha256')
  h.update(a)
  h.update(b)
  return h.digest()
}

function treehash (b, block_size = 1024*1024) {
  var blocks = []
  while(b.length) {
    blocks.push(b.slice(0, block_size))
    b = b.slice(block_size)
  }

  function tree (hashes) {
    var _hashes = []
    for(var i = 0; i +1 < hashes.length; i+=2)
      _hashes.push(hash(hashes[i], hashes[i+1]))
    if(hashes.length % 2)
      _hashes.push(hashes[hashes.length-1])
    return _hashes
  }

  var hashes = blocks.map(data => hash(data))
  console.log(hashes)
  while(hashes.length >= 2) {
    console.log((hashes = tree(hashes)).map(b => b.toString('hex')))
  }

}

if(!module.parent)
  treehash(fs.readFileSync(process.argv[2]), process.env.BLOCKSIZE)