
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')
var crypto = require('crypto')

var tree = [], length = 0, _data = [], block_number = 1
var block_size = 1024*1024
var next_block = 0 + block_size
var empty = Buffer.from('')
//var hash = crypto.createHash('sha256')

function hash (a, b='') {
//  console.log('hash', a, b)
  return crypto.createHash('sha256').update(a).update(b).digest()
}

function update(block) {
  var h = crypto.createHash('sha256')
  for(var i = 0; i < block.length; i++)
    h.update(block[i])
//  console.log(h.digest('hex'))
  
  var i = 0, _h = h.digest()
  do {
    if(tree[i]) {
      _h = hash(tree[i], _h)
      //console.log(i, '->', _h)
      tree[i] = null
      i++
    }
    else {
      tree[i] = _h
      break;
    }
  } while(true)
  //*/
}

var len = 0, _block = []
pull(
  toPull.source(process.stdin),
  pull.drain((data) => {
    while(data.length) {
      if(len + data.length < block_size) {
        _block.push(data)
        len += data.length
        data = empty
      }
      else {
        _block.push(data.slice(0, block_size - len))
        data = data.slice(block_size - len)
        update(_block)
        _block = []; len = 0
      }
    }    
  }, () => {
    console.log("TREE", tree)
  })
)