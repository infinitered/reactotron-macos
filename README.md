# Reactotron macOS

> [!IMPORTANT]
> This is an experimental react-native-macos rewrite of Reactotron. Everything is some state of brokenness. If you're looking for the current stable Reactotron, go to the [main repo](https://github.com/infinitered/reactotron).

## Introduction

Reactotron is a lightweight and useful debugger, designed for React Native app development. You can monitor and debug:

- Logs (including native logs)
- State
- Network requests
- Performance metrics

You can also use Reactotron to send commands to your app, such as:

- Show a dev menu
- Reload the app
- and custom commands that you define

It's great for projects of any size, from small personal apps to large-scale enterprise applications. It's the OG debugger at Infinite Red that we use on a day-to-day basis to build client apps.

And, best of all, Reactotron is completely open source and free to use!

## Getting Started

Currently, you can only run Reactotron by cloning the repo and running it locally.

### macOS Development

```sh
git clone https://github.com/infinitered/reactotron-macos.git
cd reactotron-macos
npm install
npm run pod
npm run start
npm run macos
# for release builds (automatically bundles the server)
npm run macos-release
```

**Note:** The Reactotron server is now embedded in the macOS app and starts automatically on port 9292. No need to run a separate server process!

### Windows Development

#### System Requirements

First, install the system requirements for React Native Windows: https://microsoft.github.io/react-native-windows/docs/rnw-dependencies

**Alternative**: If you experience issues with the official `rnw-dependencies.ps1` script, consider using Josh Yoes' improved setup process: https://github.com/joshuayoes/ReactNativeWindowsSandbox

#### Running the App

```sh
git clone https://github.com/infinitered/reactotron-macos.git
cd reactotron-macos
npm install
npm run windows-link
npm run start
npm run windows
# for release builds
npm run windows-release
```

### Cross-Platform Native Development

Both platforms use unified commands for native module development:

- **macOS**: `npm run pod` - Links native modules using CocoaPods
- **Windows**: `npm run windows-link` - Links native modules using MSBuild

See [Making a TurboModule](./docs/Making-a-TurboModule.md) for detailed native development instructions.

### Server Bundle

If you modify the standalone server code (`standalone-server.js`), rebuild the bundle:

```sh
npm run bundle-server
```

The bundle is automatically generated during release builds (`npm run macos-release`).

## Enabling Reactotron in your app

> [!NOTE]
> We don't have a simple way to integrate the new Reactotron-macOS into your app yet, but that will be coming at some point. This assumes you've cloned down Reactotron-macOS.

The Reactotron server is now embedded in the macOS app and starts automatically when you launch it. Simply:

1. Run the Reactotron macOS app (via `npm run macos` or the built .app)
2. The server will automatically start on port 9292
3. In your app, add the following to your app.tsx:

```tsx
if (__DEV__) {
  const Reactotron = require("reactotron-react-native").default
  Reactotron.configure({
    name: require("../package.json").name,
    port: 9292,
    onConnect: () => {
      Reactotron.log(`Reactotron app ${Reactotron.options.name} connected to standalone server.`)
    },
  })
  Reactotron.connect()
}
```

4. Start your app and you should see logs appear in Reactotron.

### Running the Server Standalone (Optional)

If you need to run the server without the GUI (for CI/CD or headless environments), you can still run:

```sh
node -e "require('./standalone-server').startReactotronServer({ port: 9292 })"
```

### Server Implementation Details

The embedded server:

- Starts automatically when the app launches
- Stops automatically when the app quits
- Runs on port 9292 by default (configurable in `AppDelegate.mm`)
- Is bundled as a single file with all dependencies
- Requires Node.js to be installed on the system
- Supports nvm, asdf, fnm, and other Node version managers

## Get Help

Join the [Infinite Red Community Slack](https://community.infinite.red) and ask questions in the `#reactotron` channel.
