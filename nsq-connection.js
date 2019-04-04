module.exports = function (RED) {
  function NsqConnection (config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.name = config.name
    node.host = config.host
    node.port = config.port
  }
  RED.nodes.registerType("nsq-connection", NsqConnection);
}