var TreeHash = require('./')
var TreeHashFlat = require('./flat')
var opts = require('minimist')(process.argv.slice(2))
var {height, block2leaf_index} = require('./util')
var {print_tree} = require('./print')
var cmd = opts._.shift()
var input_name = opts._.shift()
var input
var value = opts._.shift()
var block_size = 1024*1024
var ALG = 'sha256'
if(cmd === 'help' || opts.help) {
  console.error('usage:')
  console.error('treehash <command> <filename>|. {--tree,--line_numbers?}')
  console.error()
  console.error('  tree           # pretty print the tree hash as a tree')
  console.error('    --branch_numbers # modifies --tree to include branch number of the tree.') 
}

const
  TREE = 'tree',
  PROOF = 'proof',
  BLOCK = 'block',
  HASH = 'hash',
  VERIFY = 'verify',
  APPEND = 'append'

var isTree = cmd === TREE
var isProof = cmd === PROOF
var th = isTree || isProof ? new TreeHashFlat() : new TreeHash()

var block = cmd === BLOCK ? opts.block || value : 0

var start = block * block_size
//note, end is inclusive, so need - 1 there
var end   = cmd === BLOCK ? ((block+1) * block_size) - 1 : Infinity

if (cmd === BLOCK) {
  if(input_name == '.' || !input_name) {
    console.error('block command requires filename input')
    process.exit(1)
  }
  else
    input = require('fs').createReadStream(input_name, { start, end })
  return input.pipe(process.stdout)
}
else {
  if(input_name == '.' || !input_name)
    input = process.stdin
  else
    input = require('fs').createReadStream(input_name, { start, end })
}

if (cmd === VERIFY) {
  //open file
  input.on('data', (d) => {
    th.update(d)
  })
  .on('end', () => {


  })


  return
}

input.on('data', (data) => {
  th.update(data)
})
.on('end', () => {
  if(isTree || isProof) {
    var h = th.digest()
    if(isTree)
      console.log(print_tree(th.tree, opts))
    else if(isProof) {
      var block_index = ~~+(opts.proof || value)
      var leaf_index = block2leaf_index(opts.proof || value)
      console.log(JSON.stringify({
        index: leaf_index,
        root: th.digest().toString('hex'),
        proof: th.proof(leaf_index).map(e=>e.toString('hex')),
        alg: ALG,
        block_size
      }, null, 2))
    }
  }
  else
    console.log(th.digest().toString('hex'))

})
