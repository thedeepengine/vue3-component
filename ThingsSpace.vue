<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
  <div id="things_space_container" ref="containerRefThingsSpace">
    <!-- <n-button @click="aaaa" style="position: fixed;top:200px;left:400px;z-index:9999999999">AAAAA</n-button> -->
    <v-chart ref="myChartRef" id="thingsworld" class="chart" :option="things_space_option" autoresize />
    <div v-if="show_message" class="message-container">
      <!-- <div>Get vectors for:</div> -->
      <div class="fmw-thing-space-button" @click="generate_vect">
        {{ dim_store.header_prop_name }}
      </div>
      <div class="fmw-thing-space-button">
        Show me examples
      </div>
    </div>
  </div>
</template>




<script setup>
import axios from 'axios'
import VChart from "vue-echarts";
import { Scatter3DChart } from 'echarts-gl/charts';
import { Grid3DComponent } from 'echarts-gl/components';
import { TitleComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from 'echarts/renderers';
import { use } from "echarts/core";
import { watch, ref, onMounted } from "vue";
import { dimStore } from '@/components_shared/dimStore.js'
import { NButton } from 'naive-ui'

// import * as echarts from 'echarts';
// import 'echarts-gl';

use([LegendComponent, TooltipComponent, Scatter3DChart, Grid3DComponent, TitleComponent, CanvasRenderer]);


const dim_store = dimStore()
const options = ref({})
const dim_reduced_data = ref()
const show_message = ref(false)
const things_space_option = ref()


const apiClient = axios.create({
  baseURL: 'https://localhost:8002/',
  headers: {
    'Content-Type': 'application/json'
  }
});

onMounted(()=> {
  if (dim_store.things_space_data.length === 0) {
    show_message.value = true
    things_space_option.value = get_echart_options([])
  }
})

watch(() => dim_store.things_space_data, (new_data, old_data) => {
  if ('ALT' in new_data) {
    show_message.value = true
    things_space_option.value = get_echart_options([[1, 1, 1]])
  } else {
    let reduced = get_dimension_reduction(new_data)
    things_space_option.value = get_echart_options(reduced)
  }
})


function extractFieldValues(obj, fieldName) {
  let result = [];

  function traverse(node) {
    if (node[fieldName] !== undefined) {
      result.push(node[fieldName]);
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child));
    }
  }

  traverse(obj);
  return result;
}




function generate_vect(event) {
  let request = dim_store.conversation_history.at(-1).message
  apiClient
    .post("https://localhost:8002/v1/api/get_on_the_fly_things_space/", { clt_name: dim_store.selected_clt, request: request, dimension: 'things_space', header_prop_name: dim_store.header_prop_name })
    .then(response => {
      let reduced = get_dimension_reduction(response.data.things_space)
      things_space_option.value = get_echart_options(reduced)
      // dim_store.w_data
      show_message.value = false
    })



  // let to_vectorize = extractFieldValues(dim_store.w_data, event.srcElement.innerText)
  // apiClient
  //     .post("https://localhost:8002/v1/api/get_vector/", {to_vectorize: to_vectorize})
  //     .then(response => {
  //       let reduced = get_dimension_reduction(response.data.things_space)
  //       things_space_option.value = get_echart_options(reduced)
  //       dim_store.w_data
  //       show_message.value = false
  //     })

}

function get_dimension_reduction(response) {
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

  var t = dr(vectors, 'UMAP')
  var Y = t.transform();
  var mat = Y.asArray



  let res = response.map((obj, index) => ({
  ...obj,
  value: mat[index]
}));

  return res

}


function get_echart_options(data) {
  let option = {
    tooltip: {},
    legend: {},
    grid3D: {
      show: true,
      splitLine: {show:false},
      axisPointer: {
            show: false  // Disables axis pointers in 3D grid globally
        }
    },
    xAxis3D: {
      type: 'value',
      axisTick: {show: false},
      axisLabel: {show: false},
      axisLine: {lineStyle: {opacity: 0}}, 
      name: '',
      axisPointer: {
            show: false  // Disables the axis pointer on the X-axis
        }
    },
    yAxis3D: {
      type: 'value',
      axisTick: {show: false},
      axisLabel: {show: false},
      axisLine: {lineStyle: {opacity: 0}}, 
      name: '',
      axisPointer: {
            show: false  // Disables the axis pointer on the X-axis
        }
    },
    zAxis3D: {
      type: 'value',
      name: '',
      axisLabel: {show: false},
      axisLine: {lineStyle: {opacity: 0}}, 
      axisTick: {show: false} ,
      splitLine: {show:true, lineStyle: {opacity: 0}},
      axisPointer: {
            show: false  // Disables the axis pointer on the X-axis
        }
    },
    series: [{
      type: 'scatter3D',
      // color: "#d4af37",
      symbolSize: 20,
      label: {
        show: true,
        fontSize: 10,
        // color: "#1F2937",
        // color: "#d4af37",
        formatter: function (value) {
          return value['name'];
        },
      },
      // data: data.a || [1,1,1]
      // data: [[1, 1, 1]]
      data: data
      // data: [{name: 'sssaaas', value: [1,1,1],  
      // "itemStyle":{"color": "#d4af37"},
      // "label": {
      //               "show": true,
      //               "color": '#1F2937' 
      //           }}]
      // data: Object.entries(data).map(([key,value]) => {
      //   [{name:value.name, value: value.value}]
      // })


      // data: [1,1,1]
      // data: Object.entries(data).map(([key, value]) => {
      //   // return [1,1,1]
      //   option.series.push({
      //     name: key, 
      //     data: value
      //   })
      // })
    }]
  }

  // option.legend = {
  //   bottom: '10%',
  //   right: '10%',
  //   data: Object.keys(data),
  // };
  return option
}

</script>

<style scoped>
.chart {
  height: 100vh;
  width: 50vw;
}

#things_space_container {
  display: flex;
  flex-direction: column;
  width: 50vw;
  height: 95vh;
  justify-content: center;
  align-items: center;
}

.fmw-thing-space-button {
  background-color: #1f2937;
  color: white;
  border-radius: 0.1rem;
  position: relative;
  border: none;
  padding: 2px 25px;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  font-size: 12px;
  font-weight: 300;
  width: fit-content;
  margin: 4px;
  /* pointer-events: none; */
}


.message-container {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>