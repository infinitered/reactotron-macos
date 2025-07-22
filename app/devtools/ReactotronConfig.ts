/**
 * This file does the setup for integration with Reactotron, which is a
 * free desktop app for inspecting and debugging your React Native app.
 * @see https://github.com/infinitered/reactotron
 */
import { NativeModules } from "react-native"

import Reactotron from "reactotron-react-native"

Reactotron.configure({
  name: require("../../package.json").name,
  // port: 9095,
  onConnect: () => {
    /** since this file gets hot reloaded, let's clear the past logs every time we connect */
    Reactotron.clear()
    Reactotron.log("Reactotron app connected to reactotron server.")
  },
})

// Reactotron.use(
//   mst({
//     /* ignore some chatty `mobx-state-tree` actions */
//     filter: (event) => /postProcessSnapshot|@APPLY_SNAPSHOT/.test(event.name) === false,
//   }),
// )

// Reactotron.use(mmkvPlugin<ReactotronReactNative>({ storage }))

/**
 * Reactotron allows you to define custom commands that you can run
 * from Reactotron itself, and they will run in your app.
 * Restart your whole app anytime you change this file.
 */
Reactotron.onCustomCommand({
  title: "Show Dev Menu",
  description: "Opens the React Native dev menu",
  command: "showDevMenu",
  handler: () => {
    Reactotron.log("Showing React Native dev menu for app: " + Reactotron.options.name)
    NativeModules.DevMenu.show()
  },
})

/**
 * We're going to add `console.tron` to the Reactotron object.
 * Now, anywhere in our app in development, we can use Reactotron like so:
 *
 * ```
 * if (__DEV__) {
 *  console.tron.display({
 *    name: 'JOKE',
 *    preview: 'What's the best thing about Switzerland?',
 *    value: 'I don't know, but the flag is a big plus!',
 *    important: true
 *  })
 * }
 * ```
 *
 * Use this power responsibly! :)
 */
console.tron = Reactotron

/**
 * We tell typescript about our dark magic
 *
 * You can also import Reactotron yourself from ./reactotronClient
 * and use it directly, like Reactotron.log('hello world')
 */
declare global {
  interface Console {
    /**
     * Reactotron client for logging, displaying, measuring performance, and more.
     * @see https://github.com/infinitered/reactotron
     * @example
     * if (__DEV__) {
     *  console.tron.display({
     *    name: 'JOKE',
     *    preview: 'What's the best thing about Switzerland?',
     *    value: 'I don't know, but the flag is a big plus!',
     *    important: true
     *  })
     * }
     */
    tron: typeof Reactotron
  }
}

/**
 * Now that we've setup all our Reactotron configuration, let's connect!
 */
Reactotron.connect()

export { Reactotron }
