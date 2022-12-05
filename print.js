var {height, root, next_branch} = require('./util')

function print_tree (tree, opts = {}) {
  opts.block_size = opts.block_size || 1024*1024
  var max = height(root(tree.length-1))
  var a = []
  var s = ''
  for(var i = 1; i < tree.length; i++) {
    a[i] = //i.toString(2).padStart(8) +
      ''.padStart((max - height(i))*2, ' ') + tree[i].toString('hex').substring(0, 8)
  }
  function insert (row, column, char) {
    var r = a[row]
    if(r)
    a[row] = r.substring(0, column-1) + char + r.substring(column)
  }

  for(var j = 4; j < tree.length; j+=2) {
    var h = height(j)
    var _h = 3 + (max - h)*2
    for(var k = 1; j+k < next_branch(j); k++) {
      insert(j-k, _h, '|')
      if(next_branch(j) < tree.length+1)
        insert(j+k, _h, '|')
    }
  }

  if(opts.branch_numbers) {
    var ll = a.length.toString().length
    a = a.map(function (e, i) {
      var isRoot = root(tree.length-1) === i
      return i.toString().padStart(ll) + (isRoot ? ' ==> ' : '     ') + e

    })
  }
  if(opts.offsets) {
    a = a.map((line, i) => {
      if(!(i%2)) return line
      return line + ' [' + (opts.block_size*(i-1)).toString(opts.offsets == 'hex' ? 16 : 10) + ']'
    })

  }
  return a.join('\n')
}

module.exports = {print_tree}