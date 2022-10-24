var crypto = require('crypto')

// non streaming implementetanion

// the benefit of this however, is that it is more obviously correct

module.exports = function (b, block_size=1024*1024) {
  var blocks = []
  while(b.length) {
    blocks.push(b.slice(0, block_size))
    b = b.slice(block_size)
  }

  function hash (a, b = '') {
    var h = crypto.createHash('sha256')
    h.update(a)
    h.update(b)
    return h.digest()
  }

  function tree (hashes) {
    var _hashes = []
    for(var i = 0; i +1 < hashes.length; i+=2)
      _hashes.push(hash(hashes[i], hashes[i+1]))
    //if there was an odd number of hashes, copy the last hash over
    if(hashes.length % 2)
      _hashes.push(hashes[hashes.length - 1])
    return _hashes
  }

  var hashes = blocks.map(data => hash(data))
  while(hashes.length >= 2) {
    hashes = tree(hashes)
  }
  return hashes[0]
}