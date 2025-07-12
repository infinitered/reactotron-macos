const connectedReactotrons = []

function startReactotronServer(opts = {}) {
  const { createServer } = require("reactotron-core-server")

  // configure a server
  const server = createServer({
    port: 9292, // default
    ...opts,
  })

  server.start()

  server.wss.on("connection", (socket, _request) => {
    // Subscribe to the very first message just in case this is a Reactotron app
    // trying to connect.
    socket.on("message", (incoming) => {
      const message = JSON.parse(incoming.toString())
      if (message.type === "reactotron.subscribe") {
        // Add the Reactotron app to the list of connected Reactotron apps
        connectedReactotrons.push(socket)

        // Send a message back to the Reactotron app to let it know it's connected
        socket.send(JSON.stringify({ type: "reactotron.connected" }))
        console.log("Reactotron app connected")
      } else if (connectedReactotrons.includes(socket)) {
        console.log("Reactotron app message: ", message)
        // Forward to the Reactotron Core Server to send to client(s)
        server.send(message.type, message.payload, message.clientId)
      }
    })
  })

  // The server has started.
  server.on("start", () => console.log("Reactotron started"))

  // A client has connected, but we don't know who it is yet.
  server.on("connect", (conn) => console.log("Connected", conn))

  // A client has connected and provided us the initial detail we want.
  server.on("connectionEstablished", (conn) => {
    connectedReactotrons.forEach((reactotronApp) => {
      // conn here is a ReactotronConnection object
      // We will forward this to all connected Reactotron apps.
      // https://github.com/infinitered/reactotron/blob/bba01082f882307773a01e4f90ccf25ccff76949/apps/reactotron-app/src/renderer/contexts/Standalone/useStandalone.ts#L18
      reactotronApp.send(JSON.stringify({ type: "connectionEstablished", conn }))
    })
  })

  // A command has arrived from the client. (Maybe?)
  server.on("command", (cmd) => {
    console.log("Command: ", cmd)
    // send the command to all connected Reactotron apps
    connectedReactotrons.forEach((reactotronApp) => {
      console.log("Sending command to Reactotron app: ", cmd.type)
      reactotronApp.send(JSON.stringify({ type: "command", cmd }))
    })
  })

  // A client has disconnected.
  server.on("disconnect", (conn) => {
    console.log("Disconnected", conn)

    // Forward the disconnect to all connected Reactotron apps
    connectedReactotrons.forEach((reactotronApp) => {
      // conn here is a ReactotronConnection object
      // We will forward this to all connected Reactotron apps.
      // https://github.com/infinitered/reactotron/blob/bba01082f882307773a01e4f90ccf25ccff76949/apps/reactotron-app/src/renderer/contexts/Standalone/useStandalone.ts#L18
      reactotronApp.send(JSON.stringify({ type: "disconnect", conn }))
    })
  })

  // The server has stopped.
  server.on("stop", () => console.log("Reactotron stopped"))

  // Port is already in use
  server.on("portUnavailable", () => console.log("Port 9090 unavailable"))

  // start the server
  server.start()

  // check to see if it started
  if (!server.started) {
    console.log("Server failed to start")
    return
  }

  // // say hello when we connect (this is automatic, you don't send this)
  // server.send("hello.server", {})

  // // request some values from state
  // server.send("state.values.request", { path: "user.givenName" })

  // // request some keys from state
  // server.send("state.keys.request", { path: "user" })

  // // subscribe to some state paths so when then change, we get notified
  // server.send("state.values.subscribe", { paths: ["user.givenName", "user"] })

  // // stop the server
  // server.stop()

  // stop the server on SIGINT (metro shutdown)
  process.on("SIGINT", () => {
    server.stop()
    process.exit(0)
  })
}

module.exports = { startReactotronServer }
