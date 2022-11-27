
var TreeHash = require('../')
var blocksize = 1

var th = new TreeHash(1)

th.update('a')
console.log(1, th.digest(), th.tree)
th.update('a')
console.log(2, th.digest(), th.tree)
th.update('a')
console.log(3, th.digest(), th.tree)
th.update('a')
console.log(4, th.digest(), th.tree)
th.update('a')
console.log(5, th.digest(), th.tree)
th.update('a')
console.log(6, th.digest(), th.tree)
th.update('a')
console.log(7, th.digest(), th.tree)
th.update('a')
console.log(8, th.digest(), th.tree)

