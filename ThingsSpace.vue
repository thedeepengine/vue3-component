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

watch(() => [dim_store.w_data, dim_store.dimension],
  ([new_data, new_dimension], [old_data, old_dimension]) => {
    console.log('new_dimension ', new_dimension)
    if (new_dimension === 'things_space') {
      options.value=things_space_options(new_data)
    }
  }
);



function things_space_options(data) {
      let option = {
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
        grid3D: {},
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
          name: key, data: value
        })
      })

      option.legend = {
        bottom: '10%',
        right: '10%',
        data: Object.keys(data),
      };
      return option
}

// watch(
//   [dim_store.w_data,dim_store.dimension],
//   ([newWData, newDimension], [oldWData, oldDimension]) => {
//     console.log('w_data changed from', oldWData, 'to', newWData);
//     console.log('dimension changed from', oldDimension, 'to', newDimension);
//   }
// );

// watch(() => (dim_store.w_data,dim_store.dimension), (newValue, oldValue) => {
//     if (dim_store.dimension === 'Things Space') {

//     } 
// });

</script>

<style scoped>
.chart {
  height: 100vh;
  width: 50vw;
}
</style>