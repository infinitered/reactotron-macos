## What does this PR do?

<!-- Why this PR got made. A little bit about what's going. -->

## What GitHub issues does this PR fix?

<!-- Resolves #<ISSUE_NUMBER>. -->

## How to verify this code works?

### reactotron-macos setup for this PR

1. `gh pr checkout <PR_NUMBER>`
2. `npm install`
3. `npm run pod`
4. `npm run start`
5. `npm run macos`

### reactotron example app setup for this PR

1. `yarn install`
   Add Reactotron standalone server port to example app configuration

<!-- 💡 tip: `git diff --staged | pbcopy` to copy staged diff to clipboard -->
<!-- 💡 tip: `pbpaste | git apply` to apply staged diff from clipboard to the current branch -->

```diff
diff --git a/apps/example-app/app/devtools/ReactotronConfig.ts b/apps/example-app/app/devtools/ReactotronConfig.ts
index a5c7d5b6..9b9c1dad 100644
--- a/apps/example-app/app/devtools/ReactotronConfig.ts
+++ b/apps/example-app/app/devtools/ReactotronConfig.ts
@@ -18,6 +18,7 @@ import { Reactotron } from "./ReactotronClient"

 const reactotron = Reactotron.configure({
   name: require("../../package.json").name,
+  port: 9292,
   onConnect: () => {
     /** since this file gets hot reloaded, let's clear the past logs every time we connect */
     Reactotron.clear()

```

2. `yarn workspace example-app start`
3. Start on a different port to avoid conflicting with reactotron-macos
4. Press `i` to launch in iOS simulator
5. Consider `Cmd + Shift + R` to reload reactotron-macos to get connection

### Step by step of how to test this PR

1. Navigate to the feature in reactotron-macos or example app
2. See expected action

# Screenshot/Video of "How to test this PR?"

<!-- 💡 tip: Cmd + Shift + 4 on Mac to take a screenshot 📸 -->
<!-- 💡 tip: Cmd + Shift + 5 on Mac to take a screen recording 🎥 -->
