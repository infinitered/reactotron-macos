# Making a TurboModule in React Native macOS

_(Untested, from memory)_

1. Create a new Objective-C header/implementation file in the `./app/native/` folder. You can just copy the `IRFontList.mm/h` files and rename them to something like `IRMyThing.mm/h`.
2. Make them look like `IRFontList.mm/h` but with your own logic.
3. Link both files in Xcode:
   - In Xcode, select `Reactotron` in the project navigator (left sidebar, first icon).
   - Right-click on it
   - Select `Add Files to "Reactotron"`
   - Select the `IRMyThing.mm` file and click `Add`
   - Choose `Reference files in place` and make sure the target is selected
   - Click `Finish`
   - Repeat for the `IRMyThing.h` file
4. Make a TypeScript file in the `./specs/` folder. You can just copy the `NativeIRFontList.ts` file and rename it to `NativeIRMyThing.ts`.
5. Edit it to look like your own module.
6. Run codegen with: `npx react-native codegen`. It'll create a `build/generated/ios` folder (yes, `ios`).
7. Now access your new module in your app with: `import NativeIRMyThing from "specs/NativeIRMyThing"`
8. And use it (async) like this: `NativeIRMyThing.getMyThing().then((myResponse) => { console.log(myResponse) })`
9. Done!

## How to make a synchronous TurboModule

Same as above, but ...
