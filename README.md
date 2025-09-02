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

Currently, you can only run Reactotron macOS by cloning the repo and running it locally.

```sh
git clone https://github.com/infinitered/reactotron-macos.git
cd reactotron-macos
npm install
npm run pod
npm run start
npm run macos
# for release builds
npm run macos-release
```

## Enabling Reactotron in your app

> [!NOTE]
> We don't have a simple way to integrate the new Reactotron-macOS into your app yet, but that will be coming at some point. This assumes you've cloned down Reactotron-macOS.

1. From the root of Reactotron-macOS, start the standalone relay server:
   `node -e "require('./standalone-server').startReactotronServer({ port: 9292 })"`
2. In your app, add the following to your app.tsx:

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

3. Start your app and Reactotron-macOS. You should see logs appear.

## Get Help

Join the [Infinite Red Community Slack](https://community.infinite.red) and ask questions in the `#reactotron` channel.
