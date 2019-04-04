# node-red-contrib-nsq

A [NodeRED](https://nodered.org) Node for Subscribing and Publishing to [NSQ](https://nsq.io) Topics.

## Configuration

Currently, each configuration node is only capable of connecting directly to an nsqd instance. Simply provide a host and port. Support for nsqlookupd may be added in the future.

## Consuming Messages

Use the `nsq-consumer` node to subscribe to a topic channel. Optionally enable "Finish Immediately" to automatically "finish" the message. This node currently only supports one in-flight message at a time.

The node will reconnect automatically, and indicate "Ready" and the number of messages received since the last flow deployment.

If "Finish Immediately" is disabled, the message must reach an `nsq-finish` node before `msg._nsq.timeout` seconds (60 by default). You can optionally send the message to an `nsq-touch` node to extend the timeout by an additional `msg._nsq.timeout` seconds. Lastly, you can requeue your messages with the `nsq-requeue` node.

Each of the `nsq-finish`, `nsq-touch`, and `nsq-requeue` nodes only manipulate `msg._nsq`.


## Producing Messages

The node will reconnect automatically, and indicate "Ready" and the number of messages received since the last flow deployment.

Simply send a `msg.payload` and optional `msg.topic` to the `nsq-producer` node to send messages to an NSQ channel. The node does not manipulate the `msg`. In case of an error, the unmanipulated `msg` is sent on port 2.
