# swappi

<!---description_start-->

Simple Web App Processing Interface is, in it's core, an interface for monitoring and parsing your web application's static files: it can build your application on your demand, watch files in your root directory and rebuild them whenever they're changed, and run local HTTP server to serve them. However, with the addition of it's powerful plugins, Swappi can encapsulate your entire application's codebase and it's build process, so that you can focus on really matters: coding awesome web.

- Processes your application's files as per your configuration
- Runs watcher and rebuilds application on every file change
- Runs local HTTP server and serves your application in browser
- Supports templates and reusable partials
- Optimizes images
- Minifies HTML, CSS, and JS
- Handles application routing

<!---description_end-->

## backlog

### bugs

- reload system definitely has issues
- server fails to serve 500 error file (just crashes)
- css partials injector doesn't work
- examples are not adapted to routing provider

### todo

- do i really always have to reprocess files that rely on other files?
- exclude files
- tester
- swappi elements as singletons?
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
