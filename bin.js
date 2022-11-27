var TreeHash = require('./')
var TreeHashFlat = require('./flat')
var opts = require('minimist')(process.argv.slice(2))
var {height} = require('./util')
var input_name = opts._.shift()
if(input_name == '.' || !input_name)
  input = process.stdin
else
  input = require('fs').createReadStream(input_name)

var isTree = opts.tree || opts.t
var th = isTree ? new TreeHashFlat() : new TreeHash()
  input.on('data', (data) => {
    th.update(data)
  })
  .on('end', () => {
    if(isTree) {
      th.digest()
      for(var i = 0; i < th.tree.length; i++) {
        console.log(height(i), th.tree[i])
      }
    }
    else
      console.log(th.digest().toString('hex'))
  })
