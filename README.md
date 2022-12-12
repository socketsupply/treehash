
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


## cli

## example

I generated a file full of 10mb of random data.
The default block size is 1 mb, so this is a ten block file.

```
> head -c 10m /dev/random > rand.file
```
then generated the hash tree

```

> I generated a file full of 10mb of random data

```
> head -c 10m /dev/random > rand.file
```
then generated the hash tree

```
> hashtree tree rand.file --offsets --branch_numbers

 1             08c14826 [0]
 2           1d531ce1
 3           | 6017b878 [2097152]
 4         00df9926
 5         | | 80d21867 [4194304]
 6         | 33422e6f
 7         |   596ff545 [6291456]
 8       0afbbebe
 9       | |   3e549a99 [8388608]
10       | | bfc40606
11       | | | 8fc6795a [10485760]
12       | 102e108d
13       |   | 6686c501 [12582912]
14       |   ca4f7560
15       |     575b1dac [14680064]
16 ==> 47715cba
17             5334c047 [16777216]
18           c50255cd
19             5c8a2a5d [18874368]
 ```

I have included `--offsets` to show the byte offset of each block,
and `--branch_numbers` to show the the branch numbers.
These are considered internal details but are important if you wish to understand the algorithm.

If the size of the file (in blocks) is a power of 2, then the tree will be symmetric.
If it's not, as in this file, there will be a trailing portion.

`47715cba` is the "root" or "top" hash. It represents the entire file.
The tree allows us to prove that any given block or range of blocks is part of this file.

Lets generate a proof that block 0 (corresponding to branch 1) is part of thks file.

```
> treehash proof rand.file 0
{
  "index": 1,
  "root": "47715cba8ddd34050f5f152362b9ab8e6cd8f09c4b479c9f27d81231adea29cc",
  "proof": [
    "6017b878002d3dce7dedc83bbe2bcde7e598e88db3247323a1afc2cf8d4d6af9",
    "33422e6f3a2dbbd85982e1731cff55334711256eb9446d9059f2cd0faae12642",
    "102e108dad94f9f4b783f293b1fd780d63185a9a4a5a5fcd2dc176131360a2d8",
    "c50255cd1c2711f6aacefd37b73bd086e85468172b6f02add5cf039dfcef2572"
  ],
  "alg": "sha256",
  "block_size": 1048576
}
```

the proof contains a list of the hashes that are needed to reconstruct the root hash,
given that you have the file up to the first block.

also, save the proof
```
> treehash proof rand.file 0 > proof.json
```
now, verify, first we need to separate the first block.
There is a command for that.

```
> treehash block rand.file 0 > block0_rand.file
```
the head command can also be used
```
head -c 1m rand.file > block0_rand.file
```

now verify the proof that block0 is really a part of `47715cba8ddd34050f5f152362b9ab8e6cd8f09c4b479c9f27d81231adea29cc`
```
> treehash verify block0_rand.file proof.json
47715cba8ddd34050f5f152362b9ab8e6cd8f09c4b479c9f27d81231adea29cc
```
if it output the same tophash, and didn't exit with an error, then they verification was successful.

### tree <input>

print the complete hash tree of the input file.

### proof <input> <index>

create a proof that that the block at <index> is part of the input file.

### verify <input> <proof>