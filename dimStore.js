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


    function set_dimension(dimension_to_set) {
        dimension.value = dimension_to_set
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
    
        set_dimension}

})
