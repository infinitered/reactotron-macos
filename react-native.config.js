module.exports = {
  reactNativePath: "./node_modules/react-native-macos",
  dependencies: {
    // Include our Windows native modules in autolinking
    'reactotron-native-modules': {
      platforms: {
        windows: {
          sourceDir: '../windows/reactotron',
          solutionFile: '../windows/reactotron.sln',
          projects: [
            {
              projectFile: '../windows/reactotron/reactotron.vcxproj',
            }
          ]
        }
      }
    }
  }
}
