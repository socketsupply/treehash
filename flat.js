var Blocks = require('./blocks')
var crypto = require('crypto')
var {height} = require('./util')
function hash (a, b='') {
  if(Array.isArray(a)) {
    var h = crypto.createHash('sha256') 
    for(var i = 0; i < a.length; i++)
      h.update(a[i])
    return h.digest()
  }
  return crypto.createHash('sha256').update(a).update(b).digest()
}

class TreeHashFlat extends Blocks{
  constructor (block_size=1024*1024) {
    super(block_size)
    this.index = 1
    this.tree = []
    this.queue = []
  }
  updateBlock (data) {
    this.queue.push(data)
  }
  maybeDigest (i) {
    var h = height(i)
    if(h && !this.tree[i]) {
      if(this.tree[i-h] && this.tree[i+h]) {
        this.tree[i] = hash(this.tree[i+h], this.tree[i-h])
        console.log(i, h,  this.tree[i-h], this.tree[i+h], '->', this.tree[i])
     }
    }
  }
  digestBlock () {
    this.tree[this.index] = hash(this.queue)

    console.log("DIGEST BLOCK", this.index, this.tree[this.index])
    this.maybeDigest(this.index-1)
//    this.maybeDigest(this.index+1)
    this.index += 2
    this.queue = [];
    //and now hash the blocks above this block
  }

  verify () {}

  proof () {}

  digest () {
    if(this.queue.length) {
      var i = this.index
      var q = this.queue
      this.digestBlock()
    //reset queue and index, because this isn't a full tree yet so more blocks may be added
      this.queue = q
      this.index = i
    }
    console.log('digest', this.tree.length, this.tree)
    return this.tree[this.tree.length/2]
  }

}

module.exports = TreeHashFlat