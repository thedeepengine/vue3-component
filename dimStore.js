import axios from 'axios'
import { ref, onMounted, watch, computed } from "vue";
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
  const things_space_data = ref(undefined)
  const things_space_option = ref({})

  // conversation
  const stream_status = ref('')
  const stream_content = ref([])
  const user_input = ref('')

  // graphql
  const code = ref()

  //popup box
  const isVisible = ref(false);
  const position = ref({ x: 400, y: 400 }); 
  const isDragging = ref(false);
  const lastPosition = ref({ x: 0, y: 0 });
  const popup_text = ref('ooooo')


  watch(() => user_input.value, (newValue, oldValue) => {
    fetch_data('NodeTest', newValue)
  })

  watch(() => [things_space_data.value, dimension.value],
  ([new_data, new_dimension], [old_data, old_dimension]) => {
    console.log('new_dimension', new_dimension)
    if (new_dimension === 'things_space') {
      // if (new_data !== undefined) {
        new_data = [{}]
        console.log('new_data', new_data)
        let reduced=getThingSpace(new_data)
        things_space_option.value=things_space_options(reduced)
        console.log('things_space_option.value', things_space_option.value)
      // }
    }
  }
);


const popUpBoxStyle = computed(() => ({
  position: 'fixed',
  top: `${position.value.y}px`,
  left: `${position.value.x}px`,
  cursor: isDragging.value ? 'grabbing' : 'grab',
  userSelect: 'none',
  'z-index': 99999999999999
}));


// var model = monaco.editor.createModel(JSON.stringify(json, null, '\t'), "json", modelUri);


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
      code.value = response.data.graphql

      code.value = JSON.stringify(code.value, null, '\t')
      // console.log('code.value: ', code.value)
      // JSON.stringify(code.value)

      // code.value = 

      // console.log('code', code.value)
      return response
    })
}

function getThingSpace(response) {
  let nNeighbors = 15
  if (response.length < 15) {
    nNeighbors = response.length
  }

  function dr(data, dr_method) {
    const X = druid.Matrix.from(data);
    const DR = druid[dr_method];
    const P = { d: 3, n_neighbors: nNeighbors };
    return new DR(X, { ...P });
  }

  let vectors = response.map(obj => obj.value);
  let names = response.map(obj => obj.name);
  let colors = response.map(obj => obj.color);
  let category = response.map(obj => obj.category);

  var t = dr(vectors, 'UMAP')
  var Y = t.transform();
  var mat = Y.asArray

  let res = mat.map((item, index) => {
    return { 'value': item, 'name': names[index], 'color': colors[index], 'category': category[index] || '_' }
  });

  const byCategory = res.reduce((acc, obj) => ({
    ...acc,
    [obj.category]: [...(acc[obj.category] || []), obj]
  }), {});

  // dim_reduced_data.value = byCategory
  return byCategory

}

function things_space_options(data) {
  let option = {
    tooltip: {},
    legend: {},
    xAxis3D: {
      type: 'value'
    },
    yAxis3D: {
      type: 'value'
    },
    zAxis3D: {
      type: 'value'
    },
    grid3D: {    
},
    series: [{type: 'scatter3D',
            label: {
              show: true,
              fontSize: 10,
              formatter: function (value) {
                return value['name'];
              },
            },
            data : [[1,1,1]]
            // data: Object.entries(data).map(([key, value]) => {
            //   return [1,1,1]
            //   // option.series.push({
            //   //   name: key, 
            //   //   data: value
            //   // })
            // })
    }]
  }

  option.legend = {
    bottom: '10%',
    right: '10%',
    data: Object.keys(data),
  };
  return option
}


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
    things_space_option,
    things_space_data,

    // conversation
    stream_status,
    stream_content,
    user_input,

    // graphql
    code,

    //popup box
    isVisible,
    position,
    isDragging,
    lastPosition,
    popup_text,
    popUpBoxStyle

  }

})
