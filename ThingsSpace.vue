<template>
  <div style="position: fixed;" id="things_space_container" ref="containerRefThingsSpace">
    <v-chart ref="myChartRef" id="thingsworld" class="chart" :option="options" autoresize />
  </div>
</template>

<script setup>
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

watch(() => [dim_store.things_space_data, dim_store.dimension],
  ([new_data, new_dimension], [old_data, old_dimension]) => {
    if (new_dimension === 'things_space') {
      let reduced = getThingSpace(new_data)
      options.value=things_space_options(reduced)
    }
  }
);

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
        series: []
      }

      Object.entries(data).map(([key, value]) => {
        option.series.push({
          type: 'scatter3D',
          label: {
            show: true,
            fontSize: 10,
            formatter: function (value) {
              return value['name'];
            },
          },
          name: key, 
          data: value
        })
      })

      option.legend = {
        bottom: '10%',
        right: '10%',
        data: Object.keys(data),
      };
      return option
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

      dim_reduced_data.value = byCategory
      return byCategory

    }
</script>

<style scoped>
.chart {
  height: 100vh;
  width: 50vw;
}
</style>