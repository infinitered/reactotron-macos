echo "Downloading the RN windows dependencies manifest..."
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/joshuayoes/ReactNativeWindowsSandbox/main/ReactNativeWindows.dsc.yaml" -OutFile "ReactNativeWindows.dsc.yaml"
echo "Installing RN windows deps..."
winget configure ReactNativeWindows.dsc.yaml
echo "Downloading the windows dev tools manifest..."
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/joshuayoes/ReactNativeWindowsSandbox/main/WindowsDevTools.dsc.yaml" -OutFile "WindowsDevTools.dsc.yaml"
echo "Installing windows dev tools..."
winget configure WindowsDevTools.dsc.yaml
echo "Installing react-native-windows dependencies..."
.\node_modules\react-native-windows\scripts\rnw-dependencies.ps1
echo "Windows setup complete!"
