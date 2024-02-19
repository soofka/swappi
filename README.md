# swapp

### todo

#### now

- write unit tests
- client script
- fix bug where partials are not refreshing

#### next

- do i really always have to reprocess files that rely on other files?
- tester
- swappski elements as singletons?
- swappski->swappi?
- logfile handling to other operations
- process events and pass changed files from watcher to server - controversial for change event (changing file might impact many other files, not obvious relation between file changed and what to recompile), to be implemented for all others i guess?
- monorepo with swappi and swappi processors separately
- add processors:
  - ts
  - jsx
  - js bundler
  - css bundler
  - babel transpiler

# swn.ski

### todo:

- fix partials content
- add all assets properly to files through partials/templates
- figure out image width vs pixel density
- scroll anchor bug again
- build as per comments
- aria tags
- per page content
- full translation with meta
- favicon
- service worker
- split into libraries
  - scroll text
  - anchors
- test
  - seo manifests etc
  - history
  - lighthouse
  - w3c
  - iphone
