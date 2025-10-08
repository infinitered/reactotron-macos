#!/usr/bin/env node
/**
 * Entry point for the bundled standalone Reactotron server.
 * This file can be executed directly with Node.js and accepts a --port argument.
 */

const { startReactotronServer } = require("./standalone-server")

// Parse command line arguments
const args = process.argv.slice(2)
let port = 9292 // default port

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port" && args[i + 1]) {
    port = parseInt(args[i + 1], 10)
    if (isNaN(port)) {
      console.error(`Invalid port: ${args[i + 1]}`)
      process.exit(1)
    }
    break
  }
}

console.log(`Starting Reactotron server on port ${port}...`)
startReactotronServer({ port })
