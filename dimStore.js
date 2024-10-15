import axios from 'axios'
import { ref, onMounted, watch } from "vue";
import { defineStore } from "pinia";


export const dimStore = defineStore("dimStore", () => {
  const dimension = ref('hierarchy')
  const root_nodes = ref(undefined)
  const root_links = ref(undefined)
  const deep_level = ref(0)
  const w_data = ref({})
  const map_center = ref({ x: 0, y: 0 })
  const ontology_left_position = ref(0)
  const depth = ref(2)
  const ontology_name_selected = ref('')
  const text_box_displayed = ref(false)
  const dim_force_network_bool = ref(false)

  // tiptap editor
  const html_content = ref('')
  const md_content = ref('')

  // thingsSpace
  const things_space_data = ref()
  const thingsSpaceOption = ref({})

  // conversation
  const stream_status = ref('')
  const stream_content = ref([])
  const user_input = ref('')

  watch(() => user_input.value, (newValue, oldValue) => {
    fetch_data('NodeTest', newValue)
  })


  function set_dimension(dimension_to_set) {
    dimension.value = dimension_to_set
    console.log('dimension.value', dimension.value)
  }


  const apiClient = axios.create({
    baseURL: 'https://localhost:8002/',
    headers: {
      'Content-Type': 'application/json'
    }
  });


  function fetch_data(clt, request) {

    if (request === '') {
      request = 'name,vector,hasChildren:name'
    }

    apiClient
      .post("https://localhost:8002/v1/api/query/", { clt: clt, request: request, dimension: dimension.value })
      .then(response => {
        w_data.value = response.data.d3
        md_content.value = response.data.md
        things_space_data.value = response.data.things_space
        return response
      })
  }

  return {
    deep_level,
    root_nodes,
    root_links,
    w_data,
    map_center,
    ontology_left_position,
    depth,
    ontology_name_selected,
    text_box_displayed,
    dimension,
    dim_force_network_bool,

    set_dimension,

    //tiptap editor
    html_content,
    md_content,

    // thingsSpace
    thingsSpaceOption,
    things_space_data,

    // conversation
    stream_status,
    stream_content,
    user_input
  }

})
