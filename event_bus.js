// event_bus.js
import { reactive, toRefs, watch } from 'vue';

const events = reactive({});

export function useEventBus() {
    function emit(event, message) {
        if (!events[event]) {
            events[event] = [];
        }
        events[event].push(message);
    }

    function on(event, handler) {
        const stop = watch(
            () => events[event],
            (newMessages) => {
                if (newMessages) {
                    while (newMessages.length) {
                        handler(newMessages.shift());
                    }
                }
            },
            { deep: true }
        );
        return stop;
    }

    return { emit, on };
}
