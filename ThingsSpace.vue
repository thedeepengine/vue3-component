<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
  <div id="things_space_container" ref="containerRefThingsSpace">
    <v-chart ref="myChartRef" id="thingsworld" class="chart" 
    :option="things_space_option" autoresize />
      <div v-if="show_message" class="message-container">
      <!-- <div>Get vectors for:</div> -->
      <div v-if="show_message" 
      class="fmw-thing-space-button"
      @click="generate_vect">
        {{ dim_store.things_space_data.ALT }}
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
import { watch, ref } from "vue";
import { dimStore } from '@/components_shared/dimStore.js'

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
  let to_vectorize = extractFieldValues(dim_store.w_data, event.srcElement.innerText)
  apiClient
      .post("https://localhost:8002/v1/api/get_vector/", {to_vectorize: to_vectorize})
      .then(response => {
        let reduced = get_dimension_reduction(response.data.things_space)
        things_space_option.value = get_echart_options(reduced)
        dim_store.w_data
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
  let names = response.map(obj => obj.name);
  let colors = response.map(obj => obj.color);
  let category = response.map(obj => obj.category);

  var t = dr(vectors, 'UMAP')
  var Y = t.transform();
  var mat = Y.asArray

  let res = mat.map((item, index) => {
    return { 'value': item, 'name': names[index], 'color': colors[index], 'category': category[index] || '_' }
  });

  // const byCategory = res.reduce((acc, obj) => ({
  //   ...acc,
  //   [obj.category]: [...(acc[obj.category] || []), obj]
  // }), {});

  // return byCategory

  return res

}


function get_echart_options(data) {
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
    series: [{
      type: 'scatter3D',
      label: {
        show: true,
        fontSize: 10,
        formatter: function (value) {
          return value['name'];
        },
      },
      // data: data.a || [1,1,1]
      // data: [[1, 1, 1]]
      data: data
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
  height: 95vh;justify-content: center;
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