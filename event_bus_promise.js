import { reactive } from 'vue';

const events = reactive({});

export function useEventBus() {
    function emit(event, message) {
        if (events[event]) {
            events[event].resolve(message);
            delete events[event]; // Reset the event after resolving
        }
    }

    function on(event) {
        return new Promise((resolve) => {
            if (!events[event]) {
                events[event] = { resolve };
            }
        });
    }

    return { emit, on };
}
