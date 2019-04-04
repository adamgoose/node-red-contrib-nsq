module.exports = function (RED) {
  const nsq = require('nsqjs');

  function NsqConsumer (config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.connection = RED.nodes.getNode(config.connection);
    node.topic = config.topic
    node.channel = config.channel
    node.count = 0
    node.finishImmediately = config.finishImmediately
    node.pendingMessages = {}

    node.status({ fill: "red", shape: "ring", text: "Not Ready" })

    const consumer = new nsq.Reader(node.topic, node.channel, {
      nsqdTCPAddresses: [node.connection.host + ":" + node.connection.port]
    })

    consumer.on('error', err => {
      node.error(err)
    })
    consumer.on('ready', () => {
      node.status({ fill: "green", shape: "ring", text: `Ready (${node.count})` })
    })
    consumer.on('not_ready', () => {
      node.status({ fill: "red", shape: "ring", text: "Not Ready" })
    })
    consumer.on('message', msg => {
      node.count++
      node.status({ fill: "green", shape: "ring", text: `Ready (${node.count})` })

      let payload
      try {
        payload = msg.json()
      } catch (e) {
        payload = msg.body.toString()
      }

      if (node.finishImmediately) msg.finish()
      else node.pendingMessages[msg.id] = msg

      node.send({
        _nsq: {
          id: msg.id,
          node_id: node.id,
          timestamp: msg.timestamp,
          attempts: msg.attempts,
          timeout: msg.timeUntilTimeout() / 1000,
          has_responded: node.finishImmediately,
        },
        payload
      })
    })

    node.finishMessage = function (msg) {
      if (typeof msg._nsq != "object") return
      let pmsg = node.pendingMessages[msg._nsq.id]
      if (!pmsg) return

      pmsg.finish()
      delete node.pendingMessages[msg._nsq.id]
      msg._nsq.has_responded = true
    }

    node.touchMessage = function (msg) {
      if (typeof msg._nsq != "object") return
      let pmsg = node.pendingMessages[msg._nsq.id]
      if (!pmsg) return

      pmsg.touch()
      msg._nsq.timeout = pmsg.timeUntilTimeout() / 1000
    }

    node.requeueMessage = function (msg, delay, backoff) {
      if (typeof msg._nsq != "object") return
      let pmsg = node.pendingMessages[msg._nsq.id]
      if (!pmsg) return

      pmsg.requeue(delay * 1000, backoff)
      msg._nsq.has_responded = true
    }

    node.on('close', () => {
      consumer.close()
    })

    try {
      consumer.connect()
    } catch (e) {
      node.error(e)
      node.status({ fill: "red", shape: "ring", text: "Can't connect!" })
    }

    /// on teardown consumer.close()
  }
  RED.nodes.registerType("nsq-consumer", NsqConsumer);
}