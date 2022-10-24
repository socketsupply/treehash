'use strict'
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')
var crypto = require('crypto')

var empty = Buffer.from('')

function hash (a, b='') {
  return crypto.createHash('sha256').update(a).update(b).digest()
}

function update(block, tree) {
  var h = crypto.createHash('sha256')
  for(var i = 0; i < block.length; i++)
    h.update(block[i])
  
  var i = 0, _h = h.digest()
  do {
    if(tree[i]) {
      _h = hash(tree[i], _h)
      tree[i] = null
      i++
    }
    else {
      tree[i] = _h
      break;
    }
  } while(true)
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
    if(this.ended) throw new Error('cannot add more data already hashed tree')
    while(data.length) {
      if(this.len + data.length < this.block_size) {
        this.queue.push(data)
        this.len += data.length
        data = empty
      }
      else {
        this.queue.push(data.slice(0, this.block_size - this.len))
        data = data.slice(this.block_size - this.len)
        update(this.queue, this.tree)
        this.queue = []; this.len = 0
      }
    }
    return this
  }
  digest () {
      this.ended = true
    
     if(this.queue.length) {
        update(this.queue, this.tree)
        this.queue = []
      }
     return this.tree.filter(Boolean).reduce((a, b) => {
        //the tree array is the most recent branches of the tree
        //at the end, there may be null items, representing full subtrees
        //if there are single hashes at the end of the tree,
        //they are promoted to the next level. but we are iterating over the array from the lower levels
        //so b is the earlier hash, a is the new hash, promoted, so hash(b, a)
        return hash(b, a)
    })
  }
}

module.exports = TreeHash