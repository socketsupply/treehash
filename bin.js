var TreeHash = require('./')

var th = new TreeHash()

process.stdin.on('data', (data) => {
  th.update(data)
})
.on('end', () => {
  console.log(th.digest().toString('hex'))
})