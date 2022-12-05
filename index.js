'use strict'
var crypto = require('crypto')
var Blocks = require('./blocks')

/**
 * TreeHash - this module implements a running treehash
 *            it maintains enough data to calculate the root hash of a streaming file 
 *            and to verify new blocks as they arrive.
 *            and to create a proof that the new block creates the new hash
 */

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

class TreeHash  extends Blocks {
  constructor (block_size=1024*1024) {
    super(block_size)
    this.queue = []
    this.tree = []
  }
  updateBlock (data) {
    this.queue.push(data)
  }
  digestBlock () {
    var h
    update(h = hash(this.queue), this.tree)
    this.queue = [];
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