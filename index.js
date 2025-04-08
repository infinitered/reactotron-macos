/**
 * This is the entry point for Reactotron.
 *
 * Don't do much in here; move stuff into the app/app.tsx file, or other
 * files in the app directory.
 */

import { AppRegistry } from "react-native"
import { name as appName } from "./app.json"
import App from "./app/app"

AppRegistry.registerComponent(appName, () => App)
