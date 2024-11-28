import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import axios from 'axios'
import MentionList from './MentionList.vue'
import { ref } from 'vue';

const apiClient = axios.create({
  baseURL: 'https://localhost:8002/',
  headers: {
    'Content-Type': 'application/json'
  }
});

const findNearestHeading = (editor) => {
  let position = editor.state.selection.$from.pos;

  while (position > 0) {
    const $pos = editor.state.doc.resolve(position);
    const node = $pos.nodeBefore;
    if (node && node.type.name === 'vueComponent') {
    }
    if (node && node.type.name === 'heading') {
      return node.attrs['data-clt-name']
    }
    position--;
  }
};



const mentionData = ref([]);
const target_heading = ref()

const fetchMentionData = async () => {
  try {
    const response = await apiClient
    .post("https://localhost:8002/v1/api/get_allowed/", {clt_name: target_heading.value, output_type: 'references'})
    .then(response => {
      console.log('response.data', response.data)
      mentionData.value = response.data; 
      return ['ddddd']
      
    })  
  } catch (error) {
    console.error('Failed to fetch mention data:', error);
    mentionData.value = [];
  }
  return { mentionData, fetchMentionData };
};

export default {

  items: async ({ editor, query }) => {
    const cltName = findNearestHeading(editor);
    const response = await apiClient
    .post("https://localhost:8002/v1/api/get_allowed/", {clt_name: cltName, output_type: 'references'})
    .then(response => {
      console.log('response.data66666666', response.data)
      mentionData.value = response.data; 
      return response.data
      
    })  
      return response.filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
  },
  render: () => {
    let component
    let popup

    return {
      onStart: props => {
        component = new VueRenderer(MentionList, {
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
