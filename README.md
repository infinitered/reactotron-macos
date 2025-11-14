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
# for release builds
npm run macos-release
```

### Windows Development  

#### System Requirements

First, install the system requirements for React Native Windows by running the following in an elevated Powershell session:

```powershell
.\bin\windows-setup.ps1
```

This should install everything for you.

**Alternative**: Follow the official installation steps (results vary): https://microsoft.github.io/react-native-windows/docs/rnw-dependencies

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

**Troubleshooting**: If you run into a build error with ctype.h or ROSLYNCODETASKFACTORYCSHARPCOMPILER, try making a symlink like this (it's weird, I know):

```powershell
mklink /D "C:\Program Files\Windows Kits\10\lib" "C:\Program Files (x86)\Windows Kits\10\lib"
```

Somehow, `C:\Program Files\` instead of `C:\Program Files (x86)\` is being used, which breaks things. This makes a symlink to fix that.

You may also need to add this path to the `reactotron.vcxproj`:

```
  <ItemDefinitionGroup>
    <ClCompile>
      <AdditionalIncludeDirectories>
        $(ProjectDir)..\..\app;%(AdditionalIncludeDirectories);C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt
      </AdditionalIncludeDirectories>
    </ClCompile>
  </ItemDefinitionGroup>
```

### Cross-Platform Native Development

Both platforms use unified commands for native module development:

- **macOS**: `npm run pod` - Links native modules using CocoaPods
- **Windows**: `npm run windows-link` - Links native modules using MSBuild

See [Making a TurboModule](./docs/Making-a-TurboModule.md) for detailed native development instructions.

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
