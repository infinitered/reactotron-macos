# Making a TurboModule in React Native macOS & Windows

## Embedded (easy, simple)

This is for simple single-public-method modules. If you need more than that, use the "CLI Generated" method below.

1. Make a new TypeScript file in this format:

```ts
/* @turbomodule ModuleName.myMethod(): string
#import <Whatever/Whatever.h>
// add any imports you need here
// aside from <Foundation/Foundation.h> and <AppSpec/AppSpec.h>
// which are automatically imported for you

- (NSString *)myMethod {
  return @"Something here";
}
*/

import ModuleName from "./NativeModuleName"

export function myMethod(): string {
  return ModuleName.myMethod()
}
```

1. Add the file to `package.json` in the `generateTurboModules.files` array.

```json
{
   ...
   "generateTurboModules": {
      "files": [
         "app/utils/myMethod.ts"
      ],
      "destinationPath": "macos/build/generated/colocated"
   }
}
```

3. Run `npm run pod` to generate the Objective-C++ files and run codegen and link everything up in Xcode. The generated files can be debugged in Xcode -- find them in the `Colocated` group.

(Note: if you need to, run `COLO_LOCO_CLEAN=1 npm run pod` to clean the generated files and start fresh. Then run `npm run pod` again.)

1. Use the new method anywhere in your app like this:

```ts
import { myMethod } from "./utils/myMethod"

const result = myMethod()
console.log({ result })
```

Done!

## CLI Generated (easy, simple)

1. Run `./bin/turbomodule add IRMyThing`
2. It'll generate files in `./app/native/IRMyThing/*` ... you can move them anywhere in `./app/` or leave them there.
3. Run `npm run pod` to generate the Objective-C++ header files and run codegen and link everything up in Xcode.
4. Use the new method anywhere in your app like this:

```ts
import IRMyThing from "./native/IRMyThing/NativeIRMyThing"

const result = IRMyThing.myMethod()
console.log({ result })
```

_(You can also run `./bin/turbomodule remove IRMyThing` to remove the module if you haven't moved it from the `./app/native/IRMyThing/*` folder.)_

## Manual (advanced, more control)

1. Create a new `NativeIRMyThing.ts` file anywhere in your `./app/` folder structure. Make it look like `NativeIRKeyboard.ts` but with your own methods.
2. Create a new Objective-C++ implementation file anywhere in your `./app/` folder structure. You can just copy the `IRKeyboard.mm` file and rename it to something like `IRMyThing.mm`.
3. Customize with your own logic.
4. Run `npm run pod` to generate the Objective-C++ header files and run codegen and link everything up in Xcode.
5. Use the new method anywhere in your app like this:

```ts
import IRMyThing from "./native/IRMyThing/NativeIRMyThing"

const result = IRMyThing.myMethod()
console.log({ result })
```

## Very Manual (shouldn't be needed, don't do this)

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

---

# Making a TurboModule in React Native Windows

Windows supports the **Manual approach** (equivalent to macOS) with the same unified workflow, but currently requires explicit file creation.

## What's Available on Windows:
- ✅ **Manual TurboModule creation** with automatic detection
- ✅ **Fabric Component support** 
- ✅ **Unified linking command** (`npm run windows-link`)
- ✅ **Same developer workflow** as macOS Manual approach

## What's macOS-Only (for now):
- ❌ **Embedded TurboModules** (Objective-C in TypeScript comments)
- ❌ **CLI Generated** (`./bin/turbomodule add` equivalent)  
- ❌ **Header auto-generation** (Windows requires explicit `.h` files)

## Manual Windows TurboModules

This approach mirrors the **macOS Manual method** but with Windows-specific files.

1. **Create your TypeScript spec** anywhere in your `./app/` folder structure. Copy an existing `NativeIRSomething.ts` file and customize it.

2. **Create Windows implementation files**:
   ```
   app/native/IRMyThing/
   ├── NativeIRMyThing.ts          # TypeScript spec (shared between platforms)
   ├── IRMyThing.mm               # macOS implementation  
   ├── IRMyThing.windows.h        # Windows header (explicit)
   └── IRMyThing.windows.cpp      # Windows implementation
   ```

3. **Write your Windows header** (`IRMyThing.windows.h`):
   ```cpp
   #pragma once
   #include "NativeModules.h"

   namespace winrt::reactotron::implementation {
       REACT_MODULE(IRMyThing)
       struct IRMyThing {
           IRMyThing() noexcept = default;

           REACT_SYNC_METHOD(myMethod)
           std::string myMethod() noexcept;
       };
   }
   ```

4. **Write your Windows implementation** (`IRMyThing.windows.cpp`):
   ```cpp
   #include "pch.h"
   #include "IRMyThing.h"

   namespace winrt::reactotron::implementation {
       std::string IRMyThing::myMethod() noexcept {
           return "Hello from Windows!";
       }
   }
   ```

5. **Run the Windows linking command**:
   ```bash
   npm run windows-link
   ```
   This automatically:
   - Detects your `.windows.{h,cpp}` files
   - Generates consolidated headers for the build system
   - Runs Windows codegen
   - Links everything automatically

6. **Use in your app** (same as macOS):
   ```ts
   import IRMyThing from "./native/IRMyThing/NativeIRMyThing"
   
   const result = IRMyThing.myMethod()
   console.log({ result }) // "Hello from Windows!"
   ```

## Fabric Components Work Too!

The Windows system automatically detects and handles both:
- **🔧 TurboModules**: Use `REACT_MODULE` attributes → auto-registered  
- **🎨 Fabric Components**: Use `ComponentView` inheritance → auto-registered

## Commands Summary

```bash
# macOS
npm run pod           # Link native modules
npm run pod-clean     # Clean & regenerate

# Windows  
npm run windows-link       # Link native modules
npm run windows-link-clean # Clean & regenerate
```

The **TypeScript spec files are shared** between platforms - only the native implementations differ!
