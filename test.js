var fs = require('fs')
var crypto = require('crypto')

var blocks = [], block_size = 256

var b = fs.readFileSync(process.argv[2])
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
  return _hashes
}

var hashes = blocks.map(data => hash(data))
console.log(hashes)
while(hashes.length >= 2) {
  console.log((hashes = tree(hashes)).map(b => b.toString('hex')))
}
