
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

