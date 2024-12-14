<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
  <div id="things_space_container" ref="containerRefThingsSpace">
    <!-- <n-button @click="aaaa" style="position: fixed;top:200px;left:400px;z-index:9999999999">AAAAA</n-button> -->
    <v-chart ref="myChartRef" id="thingsworld" class="chart" 
    :option="things_space_option" autoresize 
    @click="moveToElement"/>
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
import { useEventBus } from '@/components_shared/event_bus';
// import * as echarts from 'echarts';
// import 'echarts-gl';

use([LegendComponent, TooltipComponent, Scatter3DChart, Grid3DComponent, TitleComponent, CanvasRenderer]);


const dim_store = dimStore()
const options = ref({})
const dim_reduced_data = ref()
const show_message = ref(false)
const things_space_option = ref()
const { on, emit } = useEventBus();

import { provide } from 'vue'

import { INIT_OPTIONS_KEY } from 'vue-echarts'


function moveToElement(event) {
  let uuid_front = event.data.uuid_front
  const element = document.getElementById(uuid_front);
  emit('things_space_scroll_to', {uuid_front: uuid_front, action_type: 'add'})

    setTimeout(() => {
      emit('things_space_scroll_to', {uuid_front: uuid_front, action_type: 'remove'})
    }, 1000);

  if (element) {
    const yOffset = -60;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'auto' });
  }
}


const apiClient = axios.create({
  baseURL: 'https://localhost:8002/',
  headers: {
    'Content-Type': 'application/json'
  }
});

onMounted(()=> {
  // provide(INIT_OPTIONS_KEY, {'devicePixelRatio': 2})

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
    .post("https://localhost:8002/v1/api/get_on_the_fly_things_space/", { clt_name: dim_store.selected_clt, request: request, dimension: 'things_space', header_prop_name: dim_store.header_prop_name, legacy_data: dim_store.w_data })
    .then(response => {
      let reduced = get_dimension_reduction(response.data.things_space)
      things_space_option.value = get_echart_options(reduced)
      show_message.value = false
    })

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
      shading: 'realistic',
      type: 'scatter3D',
      // color: "#d4af37",
      symbolSize: 15,
      // symbol: 'path://m630.02 371.89c-0.089843-0.67578-0.29688-1.3008-0.60938-1.8477 0.16797-0.62109 0.21484-1.2891 0.11719-1.9688-5.7344-41.68-22.797-81.039-49.348-113.78-3.4453-4.3242-7.2461-8.6719-11.977-13.688-44.246-46.664-104.01-72.363-168.25-72.363-64.004 0-123.59 25.559-167.75 71.934-4.4844 4.6484-8.7578 9.5-12.688 14.414-25.207 31.297-41.887 68.645-48.238 107.96-0.73438 4.2812-1.3203 8.6953-1.7188 13.008-0.86719 7.7812-1.3125 16.012-1.3125 24.477 0 127.76 103.94 231.71 231.7 231.71 127.81 0 231.8-103.95 231.8-231.71 0-9.4922-0.57812-18.965-1.7305-28.145zm-390.54-124.74c42.258-44.387 99.246-68.828 160.47-68.828 61.449 0 118.61 24.582 160.93 69.207 4.5195 4.7969 8.1484 8.9336 11.441 13.074 1.9805 2.4453 3.8086 4.9961 5.6797 7.5156 0.51562 2.1211 0.83594 4.2539 0.83594 6.418 0 11.801-7.875 23.504-22.773 33.855-31.832 22.312-91.656 36.18-156.12 36.18-64.555 0-124.39-13.891-156.2-36.266-14.832-10.281-22.672-21.957-22.672-33.766 0-2.125 0.31641-4.2461 0.81641-6.3594 1.8086-2.4453 3.5781-4.9141 5.4883-7.2852 3.7422-4.6758 7.8086-9.2969 12.102-13.746zm-58.262 117.05c5.0742-31.414 17.113-61.434 34.953-87.941 0.70703 12.918 9.1484 25.398 24.691 36.168 32.598 22.93 93.551 37.172 159.09 37.172 65.441 0 126.38-14.211 159.01-37.082 15.637-10.867 24.113-23.398 24.789-36.328 18.859 27.93 31.199 59.781 35.801 93.262 0.097656 0.64453 0.30078 1.2461 0.59766 1.7852-0.16016 0.60547-0.21094 1.25-0.125 1.9102 0.48828 3.8359 0.8125 7.7383 1.0898 11.656-12.621 43.684-107.03 77.742-221.31 77.742-112.71 0-206.97-33.582-220.95-77.008 0.20312-3.0234 0.41406-6.0312 0.73438-8.9531 0.38672-4.1484 0.92969-8.3008 1.6289-12.383zm218.73 257.47c-122.21 0-221.62-99.422-221.62-221.64 0-1.0469 0.070312-2.0547 0.078125-3.0977 23.91 40.934 113.03 70.648 221.39 70.648 107.71 0 198.14-30.602 221.76-71.555 0.015625 1.3398 0.11719 2.668 0.11719 4.0039 0 122.21-99.465 221.64-221.73 221.64z',
      // symbol: 'path://M25 15 A10 10 0 1 0 5 15 A10 10 0 1 0 25 15',
      // blendMode: 'lighter',
      // symbol: 'image:///test.png',
      tooltip: {
    show: false
},
      label: {
        show: false,
        fontWeight: 'bold',
        // fontSize: 10,
        position: 'top',
        color: "#1F2937",
        zlevel: 100,
        z: 2,
        // // color: "#d4af37",
        formatter: function (value) {
          return value['name'];
        },
      },
      data: data
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