import axios from 'axios'
import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import { generalStore } from '@/stores/theDeepEngineStore'

export const dimStore = defineStore("dimStore", () => {
    const root_nodes = ref(undefined)
    const root_links = ref(undefined)
    const deep_level = ref(0)
    const w_data = ref({})

    async function getHierarchy(shokuninMap, requestNature = '', updateRawMarkdown = true, idCaller = '', history = {}, justData = false) {
        if (justData) {
            store.initializeQueryOption(shokuninMap, idCaller)
          return axios
            .post("/api/getHierarchy/", shokuninMap)
        } else {
  
            store.wrapperLoading(() => {
                store.initializeQueryOption(shokuninMap, idCaller)
            return axios
              .post("/api/getHierarchy/", shokuninMap)
              .then(response => {
                console.log('idCaller: ', idCaller)
                store.currentGetHierarchy = response.data
                if (idCaller === 'openMapByClickEvent' || idCaller === 'openMap' || idCaller === 'setOntologySelected') {
                    store.addToHistory(shokuninMap, history)
                    store.activeComponent = 'markdown'
                } else if (idCaller === 'entityResolution') {
                    store.updateMarkdown(response.data.raw_markdown, shokuninMap.withER)
                }
  
                store.clickedItemId = shokuninMap.mapId
                
                if (shokuninMap.mapId === store.genesisUuid) {
                    store.genesis = response.data.hierarchy
                } else {
                    store.isLoading = false
  
                  if (response.data.hierarchy !== '') {
                    store.pythonHierarchy = response.data.hierarchy
                    w_data.value = response.data.hierarchy

                    console.log('w_data.value', w_data.value)
  
                    if (updateRawMarkdown) {
                        store.updateMarkdown(response.data.raw_markdown, shokuninMap.withER)
                    }
                  }
  
                  if (store.dimension === 'thingsspace') {
                    store.getThingSpace(response.data.thingsSpace)
                  }
                }
              })
          }, shokuninMap, requestNature, updateRawMarkdown, idCaller)
        }
      }

      onMounted(() => {
        const store = generalStore()
        })

      return { getHierarchy, deep_level }

})
