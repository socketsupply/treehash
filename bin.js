var TreeHash = require('./')
var TreeHashFlat = require('./flat')
var opts = require('minimist')(process.argv.slice(2))
var {height, block2leaf_index} = require('./util')
var {print_tree} = require('./print')
var input_name = opts._.shift()

if(opts.help) {
  console.error('usage:')
  console.error('treehash <filename>|. {--tree,--line_numbers?}')
  console.error()
  console.error('  --tree           # pretty print the tree hash as a tree')
  console.error('    --branch_numbers # modifies --tree to include branch number of the tree.') 
}
if(input_name == '.' || !input_name)
  input = process.stdin
else
  input = require('fs').createReadStream(input_name)

var isTree = opts.tree || opts.t
var isProof = opts.proof || opts.p
var th = isTree || isProof ? new TreeHashFlat() : new TreeHash()
  input.on('data', (data) => {
    th.update(data)
  })
  .on('end', () => {
    if(isTree || isProof) {
      var h = th.digest()
      if(isTree)
        console.log(print_tree(th.tree, opts))
      else if(isProof) {
        var leaf_index = block2leaf_index(opts.proof)
        console.log('root:', th.digest().toString('hex')+';')
        console.log('proof:', th.proof(leaf_index).map(e=>e.toString('hex')).join(','))
      }
    }
    else
      console.log(th.digest().toString('hex'))

  })
