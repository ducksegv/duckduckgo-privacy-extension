const $ = require('./../../node_modules/jquery');
// const EventEmitter2 = require('./../../node_modules/eventemitter2');
const mixins = require('./mixins/index.es6.js');
const store = require('./store.es6.js');

function BaseModel (attrs) {

    // TODO: do we need this?
    // By default EventEmitter2 is capped at 10 to prevent unintentional memory leaks/crashes,
    // bumping up so we can violate it. Need to do an audio/review at some point and see if we can
    // reduce some of the event binding.
    // this.setMaxListeners(500);

    // attributes are applied directly
    // onto the instance:
    $.extend(this, attrs);


    // check modelType and register with minidux store
    if (!this.modelType || typeof this.modelType !== 'string') {
        throw new Error ('model missing a modelType property')
    } else {
        store.register(this.modelType, JSON.stringify(this));
    }

};

BaseModel.prototype = $.extend({},
    // EventEmitter2.prototype,
    // mixins.events,
    {

        /**
         * Setter method for modifying attributes
         * on the model. Since the attributes
         * are directly accessible + mutable on the object
         * itself, you don't *have* to use the set method.
         *
         * However, the benefit of using the set method
         * is that changes can be broadcast out
         * to any UI components that might want to observe
         * changes and update their state.
         *
         * @param {string} attr
         * @param {*} val
         * @api public
         */
        set: function(attr, val) {

            const lastValue = this[attr] || null;
            this[attr] = val;

            // send model state update to minidux store
            store.update(
                this.modelType,
                { property: attr, value: val, lastValue: lastValue },
                JSON.stringify(this)
            );
        },



        /**
         * Actually broadcasts the changes out
         * to anyone listening.
         *
         * 2 events are emitted:
         *  - more granular a specific attribute changed: 'change:<attr>'
         *  - and the generic something changed on me: 'change'
         *
         * The change is emitted out with the new value as the first
         * arg and the old value as the second arg (if one was passed).
         *
         * @param {string} attr
         * @param {*} oldVal
         * @api private
         */

         /*
        _emitChange: function(attr, oldVal) {
            var val = this[attr];
            this.emit('change:' + attr, val, oldVal);
            this.emit('change', attr, val, oldVal);
        },
        */

        /**
         * Convenience method for code clarity
         * so we can explicitly call clear()
         * instead of doing null sets
         */
        clear: function(attr, ops) {
            this.set(attr, null, ops);
        }

    }
);

module.exports = BaseModel;
