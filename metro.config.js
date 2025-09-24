const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config")
const { spawn } = require("child_process")

const fs = require("fs")
const path = require("path")
const exclusionList = require("metro-config/src/defaults/exclusionList")

const rnwPath = fs.realpathSync(
  path.resolve(require.resolve("react-native-windows/package.json"), ".."),
)

//

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

let spawned = false
let childProcess = null

const config = {
  //
  resolver: {
    blockList: exclusionList([
      // This stops "npx @react-native-community/cli run-windows" from causing the metro server to crash if its already running
      new RegExp(`${path.resolve(__dirname, "windows").replace(/[/\\]/g, "/")}.*`),
      // This prevents "npx @react-native-community/cli run-windows" from hitting: EBUSY: resource busy or locked, open msbuild.ProjectImports.zip or other files produced by msbuild
      new RegExp(`${rnwPath}/build/.*`),
      new RegExp(`${rnwPath}/target/.*`),
      /.*\.ProjectImports\.zip/,
    ]),
    //
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  server: {
    enhanceMiddleware: (middleware) => {
      // This only runs once when Metro starts
      if (!spawned) {
        spawned = true
        childProcess = spawn(
          "node",
          ["-e", "require('./standalone-server').startReactotronServer({ port: 9292 })"],
          {
            stdio: "inherit", // pipe output directly to console
            shell: false,
          },
        )

        childProcess.on("exit", (code) => {
          console.log(`Child process exited with code ${code}`)
        })

        // Handle SIGINT (Ctrl+C) to terminate child process
        process.on("SIGINT", () => {
          if (childProcess) {
            console.log("Terminating child process...")
            childProcess.kill("SIGINT")
          }
        })
      }

      return middleware
    },
  },
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
