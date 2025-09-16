Output structure:
 - images/: final PNGs (upload to IPFS/ArDrive)
 - metadata/: ERC-721 JSON metadata
 - manifest.csv: a flat view of each token's chosen traits

Suggested next steps:
1) Upload images/ to IPFS/ArDrive and capture the CID/TxID.
2) If using a separate images base URI, re-run generator with --images-suburi.
3) Pin/Store metadata/ and point your contract's baseURI to the metadata directory.
