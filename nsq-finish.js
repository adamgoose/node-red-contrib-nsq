module.exports = function (RED) {
  function NsqFinish (config) {
    RED.nodes.createNode(this, config);
    let node = this
    node.name = config.name

    node.on('input', msg => {
      let nsq = msg._nsq || {}
      let consumer = RED.nodes.getNode(nsq.node_id)
      if (consumer) {
        consumer.finishMessage(msg)
      }
      node.send(msg)
    })
  }
  RED.nodes.registerType("nsq-finish", NsqFinish)

  function NsqTouch (config) {
    RED.nodes.createNode(this, config);
    let node = this
    node.name = config.name

    node.on('input', msg => {
      let nsq = msg._nsq || {}
      let consumer = RED.nodes.getNode(nsq.node_id)
      if (consumer) {
        consumer.touchMessage(msg)
      }
      node.send(msg)
    })
  }
  RED.nodes.registerType("nsq-touch", NsqTouch);

  function NsqRequeue (config) {
    RED.nodes.createNode(this, config);
    let node = this
    node.name = config.name
    node.delay = config.delay
    node.backoff = config.backoff

    node.on('input', msg => {
      let nsq = msg._nsq || {}
      let consumer = RED.nodes.getNode(nsq.node_id)
      if (consumer) {
        consumer.requeueMessage(msg, node.delay, node.backoff)
      }
      node.send(msg)
    })
  }
  RED.nodes.registerType("nsq-requeue", NsqRequeue);
}