import axios from 'axios'
import { ref, onMounted, watch } from "vue";
import { defineStore } from "pinia";


export const dimStore = defineStore("dimStore", () => {
    const dimension = ref('intro_network')
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
    const thingsSpaceOption = ref({})

    function set_dimension(dimension_to_set) {
        dimension.value = dimension_to_set
        console.log('dimension.value', dimension.value)
        fetch_data('JeopardyQuestion', '')
    }


    const apiClient = axios.create({
      baseURL: 'https://localhost:8002/',
      headers: {
        'Content-Type': 'application/json'
      }
    });


    function fetch_data(clt, request) {

      apiClient
          .post("https://localhost:8002/v1/api/query/", { clt: clt, request: request })
          .then(response => {
              w_data.value = response.data.d3
              md_content.value = response.data.md
              return response
          })
  }

    
    watch(() => w_data.value, (newValue, oldValue) => {
      })

      return { deep_level, 
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
      }

})
