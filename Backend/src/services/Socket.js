/**
 * @author Anthony Altieri on 11/13/16.
 */

var Pusher = require('pusher');

var pusher;


function init() {
  pusher = new Pusher({
    appId: '269598',
    key: 'be327c8cfdbd733ab9e5',
    secret: '0b28d17d90f968bf084b',
    encrypted: true
  });
}

function send(channel, event, payload) {
  pusher.trigger(channel, event, payload);
}

function generatePrivateChannel(name) {
  return `private-${name}`;
}

export default {
  init,
  send,
  generatePrivateChannel,
}