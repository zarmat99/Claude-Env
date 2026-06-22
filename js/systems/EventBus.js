// Global event emitter singleton using Phaser's EventEmitter
// Usage: import EventBus from '../systems/EventBus.js'
// EventBus.emit('event_name', data)
// EventBus.on('event_name', callback)

const EventBus = new Phaser.Events.EventEmitter();
export default EventBus;
