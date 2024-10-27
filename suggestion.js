import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import MentionList from '@/components_shared/MentionList.vue'

function findCustomSuggestionMatch(config) {
    const {
        $position,
    } = config

    const regexp = /\S/gm;  // Matches any non-whitespace character

    const text = $position.nodeBefore?.isText && $position.nodeBefore.text;

    if (!text) {
        return null;
    }

    const textFrom = $position.pos - text.length;
    const match = Array.from(text.matchAll(regexp)).pop();

    if (!match || match.input === undefined || match.index === undefined) {
        return null;
    }

    // The absolute position of the match in the document
    const from = textFrom + match.index;
    const to = from + match[0].length;

    // If the $position is located within the matched substring, return that range
    if (from < $position.pos && to >= $position.pos) {
        return {
            range: {
                from,
                to,
            },
            query: match[0],
            text: match[0],
        };
    }

    return null;
}


export default {
    items: ({ query }) => {
        return [
            'Lea Thompson', 'Cyndi Lauper', 'Tom Cruise', 'Madonna', 'Jerry Hall', 'Joan Collins', 'Winona Ryder', 'Christina Applegate', 'Alyssa Milano', 'Molly Ringwald', 'Ally Sheedy', 'Debbie Harry', 'Olivia Newton-John', 'Elton John', 'Michael J. Fox', 'Axl Rose', 'Emilio Estevez', 'Ralph Macchio', 'Rob Lowe', 'Jennifer Grey', 'Mickey Rourke', 'John Cusack', 'Matthew Broderick', 'Justine Bateman', 'Lisa Bonet',
        ].filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)
    },
    //   char: '@',
    findSuggestionMatch: findCustomSuggestionMatch,
    render: () => {
        let component
        let popup

        return {
            onStart: props => {
                component = new VueRenderer(MentionList, {
                    // using vue 2:
                    // parent: this,
                    // propsData: props,
                    // using vue 3:
                    props,
                    editor: props.editor,
                })

                if (!props.clientRect) {
                    return
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                })
            },

            onUpdate(props) {
                component.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                })
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()

                    return true
                }

                return component.ref?.onKeyDown(props)
            },

            onExit() {
                popup[0].destroy()
                component.destroy()
            },
        }
    },
}

// export function get_mention_options(allowed_clt_fields) {
//     return {
//         items: ({ query }) => {
//             return [
//                 'Lea Thompson', 'Cyndi Lauper', 'Tom Cruise', 'Madonna', 'Jerry Hall', 'Joan Collins', 'Winona Ryder', 'Christina Applegate', 'Alyssa Milano', 'Molly Ringwald', 'Ally Sheedy', 'Debbie Harry', 'Olivia Newton-John', 'Elton John', 'Michael J. Fox', 'Axl Rose', 'Emilio Estevez', 'Ralph Macchio', 'Rob Lowe', 'Jennifer Grey', 'Mickey Rourke', 'John Cusack', 'Matthew Broderick', 'Justine Bateman', 'Lisa Bonet',
//             ].filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)
//         },
//         //   char: '@',
//         findSuggestionMatch: findCustomSuggestionMatch,
//         render: () => {
//             let component
//             let popup

//             return {
//                 onStart: props => {
//                     component = new VueRenderer(MentionList, {
//                         // using vue 2:
//                         // parent: this,
//                         // propsData: props,
//                         // using vue 3:
//                         props,
//                         editor: props.editor,
//                     })

//                     if (!props.clientRect) {
//                         return
//                     }

//                     popup = tippy('body', {
//                         getReferenceClientRect: props.clientRect,
//                         appendTo: () => document.body,
//                         content: component.element,
//                         showOnCreate: true,
//                         interactive: true,
//                         trigger: 'manual',
//                         placement: 'bottom-start',
//                     })
//                 },

//                 onUpdate(props) {
//                     component.updateProps(props)

//                     if (!props.clientRect) {
//                         return
//                     }

//                     popup[0].setProps({
//                         getReferenceClientRect: props.clientRect,
//                     })
//                 },

//                 onKeyDown(props) {
//                     if (props.event.key === 'Escape') {
//                         popup[0].hide()

//                         return true
//                     }

//                     return component.ref?.onKeyDown(props)
//                 },

//                 onExit() {
//                     popup[0].destroy()
//                     component.destroy()
//                 },
//             }
//         },
//     }
// }