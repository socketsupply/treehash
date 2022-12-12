var empty = Buffer.from('')

module.exports = class Blocks {
  constructor (block_size=1024*1024) {
    this.block_size = block_size
    //tracks queue for current block
    this.len = 0
    //used to track the total input size
    this.length = 0
  }
  updateBlock (data) {
    throw new Error('subclass must implement updateBlock')
  }
  digestBlock () {
    throw new Error('subclass must implement digestBlock')
  }
  update (data) {
    //XXX TODO, actually, we want to be able to add more data, so that streaming files are possible...
    while(data.length) {
      this.length += data.length
      if(this.len + data.length < this.block_size) {
        this.updateBlock(data)
        this.len += data.length
        data = empty
      }
      else {
        var _len = this.len
        this.updateBlock(data.slice(0, this.block_size - this.len))
        this.len += data.length
        data = data.slice(this.block_size - _len)
        this.digestBlock()
        this.len = 0
      }
    }
    return this
  }
}
