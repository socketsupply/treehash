var Blocks = require('./blocks')
var crypto = require('crypto')
var {height, next_branch_with_promotion, prev_branch, root} = require('./util')

function hash (a, b='') {
  if(Array.isArray(a)) {
    var h = crypto.createHash('sha256') 
    for(var i = 0; i < a.length; i++)
      h.update(a[i])
    return h.digest()
  }
  return crypto.createHash('sha256').update(a).update(b).digest()
  //console.log('hash('+a.slice(0, 8).toString('hex')+', '+b.slice(0, 8).toString('hex')+') => '+h.slice(0, 8).toString('hex'))
  //return h
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
    //check if this is a branch between two nodes (height!=0) and if we don't have a value for it.
    if(h && !this.tree[i]) {
      //check we have the values to the left and right
      if(this.tree[i-h] && this.tree[i+h]) {
        this.tree[i] = hash(this.tree[i+h], this.tree[i-h])
        console.log(i, h,  this.tree[i-h], this.tree[i+h], '->', this.tree[i])
     }
    }
  }
  digestBlock () {
    this.tree[this.index] = hash(this.queue)

//    console.log("DIGEST BLOCK", this.index, this.tree[this.index])
//    this.maybeDigest(this.index-1)
//    this.maybeDigest(this.index+1)
    this.index += 2
    this.queue = [];
    //and now hash the blocks above this block
  }

  verify () {}

  proof () {}

  getNextBranch (i) {
    return this.tree[next_branch_with_promotion(i, this.tree.length)]
  }
  

  rehash () {
    //TODO: actually, a simpler way would be to just have functions iterated over a level,
    //so an algorithm that looked just like the one in naive could be used.
    for(var h = 1; h < Math.sqrt(this.tree.length); h++) {
      for(var i = 1 << h; i < this.tree.length; i += (1 << (h+1))) {
        if(height(i) == h) {
          this.tree[i] = hash(this.tree[prev_branch(i)], this.getNextBranch(i))
          //console.log('tree['+i+']', this.tree[i], h)
        }
      }
      //check if this level of the tree has a straggler...
    }

  }

  digest () {
    /*
    if(false && this.queue.length) {
      var i = this.index
      var q = this.queue
      this.digestBlock()
      //reset queue and index, because this isn't a full tree yet so more blocks may be added
      this.queue = q
      this.index = i
    }
    */
    this.rehash()
    //console.log(this.tree)
    return this.tree[root(this.tree.length-1)]
  }

}

module.exports = TreeHashFlat