
# treehash

Hash a large file into a tree.  
This makes it possible to verify just a portion of the file, if you know the necessary tree hashes.  
This makes it possible to download or upload just part of a file, or reupload portions of a large file that failed.
Also, this makes streaming large files or real time video possible

## todo

* implement partical verification

* request a proof for any range

* construct treehash from a file, tree hash at the end (because it's the first time the file has uploaded)

* stream to a file, verifying as we go

## proofs

files, proofs, etc

we want a file. we know it's (top) hash.
we say "give us block 1, with proof it's in <hash>"
they send the proof and a block.
we hash the block with the proof, and if it's right, we store the block and the proof.

we can then ask for another block...

the basic proof is for a sequence of blocks, and assumes you have all blocks before that.
if you needed a proof for the start, that is different.
