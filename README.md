# swappi

### bugs

- reload system definitely has issues
- server fails to serve 500 error file (just crashes)

### todo

- do i really always have to reprocess files that rely on other files?
- exclude files
- tester
- swappski elements as singletons?
- swappski->swappi?
- logfile handling to other operations
- process events and pass changed files from watcher to server - controversial for change event (changing file might impact many other files, not obvious relation between file changed and what to recompile), to be implemented for all others i guess?
- client script with routing
- shared elements selectors between html, js, css (minifiable)
- monorepo with swappi and swappi processors separately
- add processors:
  - ts
  - jsx
  - js bundler
  - css bundler
  - babel transpiler
