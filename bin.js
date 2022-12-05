var TreeHash = require('./')
var TreeHashFlat = require('./flat')
var opts = require('minimist')(process.argv.slice(2))
var {height} = require('./util')
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
var th = isTree ? new TreeHashFlat() : new TreeHash()
  input.on('data', (data) => {
    th.update(data)
  })
  .on('end', () => {
    if(isTree) {
      var h = th.digest()
      console.log(print_tree(th.tree, opts))
    }
    else
      console.log(th.digest().toString('hex'))
  })
