'use strict'
var crypto = require('crypto')

var empty = Buffer.from('')

function hash (a, b='') {
  if(Array.isArray(a)) {
    var h = crypto.createHash('sha256') 
    for(var i = 0; i < a.length; i++)
      h.update(a[i])
    return h.digest()
  }
  return crypto.createHash('sha256').update(a).update(b).digest()
}

function update(h, tree) {
  var i = 0
  while(tree[i]) {
    h = hash(tree[i], h)
    tree[i] = null
    i++
  }
  tree[i] = h
}

// verify is the same as update,
// but applies a repeated series of hashes (aka, the proof)
// while incrementing the index.
function verify(proof, tree) {
  var i = 0
  var h
  while(h = proof.shift()) {
    while(tree[i]) {
      h = hash(tree[i], h)
      tree[i] = null
      i++
    }
    tree[i] = h
  }
  return tree
}


function digest (tree) {
   return tree.filter(Boolean).reduce((a, b) => {
      //the tree array is the most recent branches of the tree
      //at the end, there may be null items, representing full subtrees
      //if there are single hashes at the end of the tree,
      //they are promoted to the next level. but we are iterating over the array from the lower levels
      //so b is the earlier hash, a is the new hash, promoted, so hash(b, a)
      return hash(b, a)
  })
}

class TreeHash  {
  constructor (block_size=1024*1024) {
    this.block_size = block_size
    this.len = 0
    this.queue = []
    this.tree = []
  }
  update (data) {
    //XXX TODO, actually, we want to be able to add more data, so that streaming files are possible...
    while(data.length) {
      if(this.len + data.length < this.block_size) {
        this.queue.push(data)
        this.len += data.length
        data = empty
      }
      else {
        this.queue.push(data.slice(0, this.block_size - this.len))
        data = data.slice(this.block_size - this.len)
        update(hash(this.queue), this.tree)
        this.queue = []; this.len = 0
      }
    }
    return this
  }
  verify (proof) {
    return digest(verify(proof, this.tree.slice()))
  }
  digest () {
    var tree = this.tree.slice()
    if(this.queue.length) {
      //update a partial block, but do not clear the block incase more data is added later
      update(hash(this.queue), tree)
    }
    return digest(tree)
  }
}

module.exports = TreeHash