module.exports = function (RED) {
  const nsq = require('nsqjs');

  function NsqProducer (config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.connection = RED.nodes.getNode(config.connection);
    node.topic = config.topic
    node.count = 0
    node.status({ fill: "red", shape: "ring", text: "Not Ready" })

    const producer = new nsq.Writer(node.connection.host, node.connection.port)
    producer.on('ready', () => {
      node.status({ fill: "green", shape: "ring", text: `Ready (${node.count})` })
      node.on('input', msg => {
        node.count++
        node.status({ fill: "green", shape: "ring", text: `Ready (${node.count})` })
        producer.publish(msg.topic || node.topic, msg.payload, err => {
          if (err) node.send([null, msg])
          else node.send([msg, null])
        })
      })
    })
    producer.on('closed', () => {
      node.status({ fill: "red", shape: "ring", text: "Not Ready" })
    })
    producer.on('error', () => {
      node.status({ fill: "red", shape: "ring", text: "Not Ready" })
    })

    node.on('close', () => {
      producer.close()
    })

    try {
      producer.connect()
    } catch (e) {
      node.error(e)
    }
  }
  RED.nodes.registerType("nsq-producer", NsqProducer);
}