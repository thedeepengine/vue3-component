import axios from 'axios'
import { ref, onMounted, watch, computed, onBeforeUnmount, onUnmounted } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import TurndownService from 'turndown';
import { md_to_html } from '@/components_shared/utils'
import { marked } from "marked";
import { tdeStore } from '@/tde/tdeStore.js'
import { useEventBus } from '@/components_shared/event_bus';
import { buildClientSchema } from 'graphql';

// const APP_TYPE = 'fmw'
// const APP_TYPE = 'tde'

export const dimStore = defineStore("dimStore", () => {
  // const is_menu_open = ref(true)
  // const dimension = ref('menu')
  // const left_panel = ref('loading')

  const { on, emit } = useEventBus();


  const tde_store = tdeStore()
  const APP_TYPE = ref('fmw')

  const dimension = ref(APP_TYPE.value === 'fmw' ? 'hierarchy':'home')
  const left_panel = ref(APP_TYPE.value === 'fmw' ? 'markdown': '')

  // const dimension = ref('hierarchy')
  // const left_panel = ref('markdown')

  const is_object_dirty = ref({
    w_data: true,
    d3_network_data: true,
    graphql_output: true,
    things_space_data: true,
    data_table: true
  })

  const is_comp_mounted = ref({editor: false})

  // header
  const llm_message = ref('')
  const selected_clt = ref('')
  const loading_flag = ref(false)
  const right_panel_message = ref(undefined)
  const show_llm_hist_box = ref(true)
  const one_shot_home = ref('')
  const last_query = ref({})

  const bus_event = ref()
  

  const is_menu_open = ref(false)
  const transaction_list = ref()

  const legacy_data = ref()
  const header_prop_name = ref(undefined)

  
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

  

  // network
  const refresh_network = ref()
  const d3_network_data = ref({})

  // tiptap editor
  const html_content = ref('')
  const md_content = ref('')
  const show_refs = ref(false)
  const refresh_map = ref(false)
  const content_type = ref('tiptap')
  const html_content_original = ref()
  const modif_stack = ref([])
  const is_dirty = ref(false)

  // thingsSpace
  const things_space_data = ref([])
  const things_space_option = ref({})


  // conversation
  const stream_status = ref('')
  const stream_content = ref([])
  const user_input = ref('')
  const conversation_history = ref([
    // { user: 'human', message: 'Hey', id: 0 },
    // { user: 'ai', message: md_to_html(`In Vue 3, to apply different styles based on the value of item.user, you can modify your class binding to include both conditions directly within the template. Here's how you can adjust your to apply a style for when item.user equals 'ai' and another style for when it equals 'human'`), id: 1 },
    // { user: 'human', message: `this is a helper`, id: 2 },
    // { user: 'ai', message: md_to_html("**fdsfddfs** ffs fd sfuds *fdfd*  fff `code block inline` fidsjfds"), id: 0 },
    // { user: 'ai', message: md_to_html(test_help), id: 0 },
    // { user: 'ai', message: `In Vue 3, to apply different styles based on the value of item.user, you can modify your class binding to include both conditions directly within the template. Here's how you can adjust your <div> to apply a style for when item.user equals 'ai' and another style for when it equals 'human'`, id: 3 },
    // { user: 'human', message: `In Vue 3, to apply different styles based on the value of item.user, you can modify your class binding to include both conditions directly within the template. Here's how you can adjust your <div> to apply a style for when item.user equals 'ai' and another style for when it equals 'human'`, id: 4 },
    // { user: 'ai', message: `In Vue 3, to apply different styles based on the value of item.user, you can modify your class binding to include both conditions directly within the template. Here's how you can adjust your <div> to apply a style for when item.user equals 'ai' and another style for when it equals 'human'`, id: 5 },
    // { user: 'human', message: `In Vue 3, to apply different styles based on the value of item.user, you can modify your class binding to include both conditions directly within the template. Here's how you can adjust your <div> to apply a style for when item.user equals 'ai' and another style for when it equals 'human'`, id: 6 },
    // { user: 'ai', message: `In Vue 3, to apply different styles based on the value of item.user, you can modify your class binding to include both conditions directly within the template. Here's how you can adjust your <div> to apply a style for when item.user equals 'ai' and another style for when it equals 'human'`, id: 7 },

    // { user: 'human', message: 'I am good thansk and you' },
    // { user: 'ai', message: 'I\'m alright. How can I help you today?' }
])
  const conv_full_screen = ref()

  // graphql
  const code = ref()
  const graphql = ref()
  const graphql_input = ref()
  const graphql_output = ref()

  //popup box
  const isVisible = ref(false);
  const position = ref({ x: 400, y: 400 });
  const isDragging = ref(false);
  const lastPosition = ref({ x: 0, y: 0 });
  const shared_popup_text = ref()

  const turndownService = ref(new TurndownService());
  const isAnimatingNew = ref(false)

  const allowed_clt_fields = ref([])
  const distinct_clt = ref([])

  const text_chunk = ref('')
  const stream_queue = ref([])
  const stream_accumulated = ref('')
  const stream_idx = ref(0)
  const stored_ids = ref([])
  const stored_tags = ref([])
  const current_stream_tag = ref([])
  const text_tracker = ref([])


  // data table
  const data_table = ref()
  const full_mode = ref(false);

  //save
  const refresh_save_page = ref()

  // left drawer
  const is_left_drawer_open = ref(false)
  const graphql_shema = ref()



  const apiClient = axios.create({
    baseURL: 'https://localhost:8002/',
    headers: {
      'Content-Type': 'application/json'
    }
  });



  watch(() => is_comp_mounted.value.editor, () => {
    if (is_comp_mounted.value.editor && one_shot_home.value !== '') {
      dimension.value = 'hierarchy'
        user_input.value = one_shot_home.value
        set_all_object_dirty()
        fetch_data(selected_clt.value, user_input.value)
        one_shot_home.value = ''
    }
})


  function set_all_object_dirty() {
    Object.keys(is_object_dirty.value).forEach(key => is_object_dirty.value[key] = true);
  }


  function run_graphql_query(query) {
    apiClient
      .post("https://localhost:8002/v1/api/graphql/", {query: query})
      .then(response => {
        graphql_output.value = response.data
        is_object_dirty.value.graphql_output = false
      })
}



const test_help = `
This is a help message, type **!!:!help** to display it again.
You can query data using 3 different ways:  
<br>
#### GraphQL syntax
<br>


Type **!!:\`\`\`+Enter** to start a terminal with syntax highlighting and hints  
  <br>

\`\`\`graphql
{
  Query {...}
}
\`\`\`  
<br>

#### Full Metal Weaviate  


For simple queries, Full Metal query syntax comes handy and intuitive:

- <a onclick="console.log('aaaa')">name,hasChildren:name,content</a> returns **!!:name**
 and references **!!:hasChildren** along with children **!!:name** and **!!:content**
 <br>

#### AI generated queries  
<br>

If you need **AI query** generation assistance or **Weaviate Gorilla**, set up your API keys.  
<br>
`


  function fetch_data(request_bundle) {
    
    apiClient
      .post("https://localhost:8002/v1/api/query/", request_bundle)
      .then(response => {
        last_query.value = request_bundle
        
        if (response.data !== null && 'error_info' in response.data) {
          
          let info_pop = document.getElementById('right_panel_message_id');
          let fmw_llm_bar = document.getElementById('fmw-llm-bar');
          const fmw_llm_bar_rect = fmw_llm_bar.getBoundingClientRect();
          right_panel_message.value = response.data.error_info

          setTimeout(() => {
            const info_popup_rect = info_pop.getBoundingClientRect();
            console.log('info_popup_rect', info_popup_rect)
            info_pop.style.top = `${fmw_llm_bar_rect.top-info_popup_rect.height-fmw_llm_bar_rect.height-20}px`
            info_pop.style.left = `${fmw_llm_bar_rect.left + fmw_llm_bar_rect.width/2 - info_popup_rect.width/2}px`
            info_pop.style.transition = '0.3s opacity'
            info_pop.style.opacity = 1
          }, 0);
        }

        if (response.data !== null && 'fmw_info' in response.data) {
          if (response.data.fmw_info === 'start_websocket') {
            conversation_history.value.push({ message: '', user: 'ai', type: 'last', id: conversation_history.value.length + 1 })
            setTimeout(() => {
              tde_store.open_websocket_con()
              emit('should_display_llm_context', true)
            }, 300);
          }
        }

        if (response.data?.legacy_data) {
          legacy_data.value = response.data.legacy_data
        }
        if (response.data?.d3) {          
          w_data.value = response.data.d3
          is_object_dirty.value.w_data = false
        }
        if (response.data?.header_prop_name) {
          header_prop_name.value = response.data.header_prop_name
        }
        if (response.data?.d3_network_data) {
          d3_network_data.value = response.data.d3_network_data
          is_object_dirty.value.d3_network_data = false
        }
        if (response.data?.md) {
          md_content.value = response.data.md
        }
        if (response.data?.things_space) {
            things_space_data.value = response.data.things_space
            is_object_dirty.value.things_space_data = false
        }
        if (response.data?.graphql_output) {
          graphql_output.value = response.data.graphql_output
          is_object_dirty.value.graphql_output = false
        }
        if (response.data?.data_table) {
          data_table.value = response.data.data_table
          is_object_dirty.value.data_table = false
        }
  
        return response
      })
  }





  function note_click_event() {
    let info_pop = document.getElementById('right_panel_message_id');
    info_pop.style.opacity = 0;
  }
  
  function streamText() {
    // const markdown = '# Main Heading\n\nthis is a paragraph\n## Subheading with **bold** text\n\nThis is a paragraph with a [link](https://example.com).';
    // const markdown = '# Main Heading\n\nthis is a paragraph\n';
    // const markdown = '# Main this is a tiltle with some custom text\n\nsimple paragraph';
    // const markdown = '# Main this **thats bold** \n\n simple paragraph';
    // const markdown = '# Main this _thats bold_ \n\n simple paragraph';
    // const markdown = '# Here is a title which is so nice _thats italic_';
    // const words = ['#', ' Here', ' is', ' a', ' title', ' which', ' is', ' so', ' nice', ' _thats', ' italic_', '\n\n', 'thast', 'a', 'paragraph'];

    // const words = ['#', ' Here', ' is', ' a', ' title', ' which', ' jjjj', '\n\n', 'thast', 'a', 'paragraph'];
    let words = ['###', ' Here', ' is', ' a', '_title', ' which_', ' jjjj', '\n\n', 'thast', 'a', 'paragraph'];
    words = words.concat('also her is a s fudsi fdhi fdsuf dsuf idufhds iufhdif dsf dfyd fyd'.split(' '))
    words = words.concat('\n\n also her is a s fudsi fdhi fdsuf \n\n dsuf idufhds iufhdif dsf dfyd fyd'.split(' '))

    // const words = ['# this ', 'is ', 'a ', 'title ', 'here ', 'as ', 'it ', 'has ', 'to ', 'be ', 'ordered '];
    let text = '';
    let i = 0

    const interval = setInterval(() => {
      text += words[i]
      text_chunk.value = words[i]

      i += 1;

      if (i >= words.length) {
        clearInterval(interval);
      }
    }, 300);
  }

  function handleAnimationEnd(event) {
    console.log('ANIMATION END ========')
    const container = current_stream_tag.value
    const word = container.getAttribute('data-new-word');
    const currentText = container.textContent;
    container.insertAdjacentText('beforeend', word);
    // container.textContent = currentText ? currentText + word : word;
    // text_tracker.value.push(container.textContent)
    container.setAttribute('data-new-word', '');
    isAnimatingNew.value = false
    let popped_up = stream_queue.value.shift()
  }


  watch(() => text_chunk.value, (n, o) => {
    console.log('text_chunk.value', text_chunk.value)
    stream_queue.value.push(text_chunk.value)
    stream_accumulated.value += text_chunk.value + ' '
  })

  watch(()=> full_mode.value, (n,o) =>{
    if (full_mode.value) {
      left_panel.value = 'loading'
    } else {
      left_panel.value = 'markdown'
    }
  })

  watch(() => stream_queue.value[0], (n, o) => {
    console.log('stream_queue.value[0]', stream_queue.value[0])
    if (stream_queue.value[0] === '\n' || stream_queue.value[0] === '\n\n') {
      let popped_up = stream_queue.value.shift()
      console.log('popped_uppopped_uppopped_uppopped_uppopped_uppopped_up: FROM NEW LINE', popped_up)
    } else if (stream_queue.value[0] !== undefined && stream_queue.value.length > 0) {
      stream_idx.value = 0
      console.log('STREAM QUEUE: =======================', stream_queue.value[0])
      console.log('PROCESSED STRING: =======================', stream_accumulated.value)
      
      const g = customLexer(stream_accumulated.value)
      let last_g = g[g.length - 1]
      // let r = last_g.text.split(' ')
      // last_g.text = r.slice(0, -1).join(' ');
      console.log('last_g.textlast_g.textlast_g.textlast_g.text: ', last_g.text)
      let last_token = getLastTokenWithParent(last_g)
      console.log('gggggg: ', g)
      console.log('last_g: ', last_g)
      console.log('last_token: ', last_token)
      let parsed = marked.parser([last_g]) // to be removed
  
      let container2
      let main_current
      container2 = document.getElementById('text-container2');
      const lastChildId = container2.lastElementChild?.id || null;

      console.log('last_g.last_id: ', last_g.id)
      console.log('lastChildId: ', lastChildId)


      if (last_g.id !== lastChildId) {
        if (['heading', 'paragraph', 'strong', 'em'].some(prefix => last_token.last_id.startsWith(prefix))) {
          if ('tokens' in last_g && last_g.tokens.length > 0) {
            last_g.tokens[last_g.tokens.length-1].text = ''
          }
          let parsed = marked.parser([last_g])
          console.log('ADJACENT: ', parsed)
          container2.insertAdjacentHTML('beforeend', parsed)
          // container2.innerText=''
          main_current = document.getElementById(last_g.id);
          main_current.classList.add('dynamic-div');
        }
      } 
      
      console.log('last_token.last_id: ', last_token.last_id)
      console.log('last_g.id: ', last_g.id)


      if (last_token.last_id === last_g.id) {
        const tag_elt = document.getElementById(last_token.last_id);
        tag_elt.classList.add('dynamic-div');
        current_stream_tag.value = tag_elt
        console.log('CURRENT TAG SET ========', current_stream_tag.value)
      } else {
        console.log('NESTED ITEM NEED FULL CURRENT UPDATE')
        let to_remove = document.getElementById(last_g.id);
        container2.removeChild(to_remove);
        console.log('parsed NESTED: ', parsed)
        container2.insertAdjacentHTML('beforeend', parsed)
        let popped_up = stream_queue.value.shift()
        console.log('popped_uppopped_uppopped_uppopped_uppopped_uppopped_up: FROM NESTED ', popped_up)
        // container2.innerHTML=parsed
      }
  
  
        console.log('LAST WORD ========== ', last_token.last_word)
        if (last_token.last_word !== null && last_token.last_word !== undefined) {
          isAnimatingNew.value = true
          console.log('LAST WORD TO ENTER ======= ', last_token.last_word)
          current_stream_tag.value.setAttribute('data-new-word', last_token.last_word);
  
  
  
          if (current_stream_tag.value.classList.contains('fade-in')) {
            current_stream_tag.value.classList.remove('fade-in');
            current_stream_tag.value.classList.add('fade-in-alt');
          } else {
            current_stream_tag.value.classList.remove('fade-in-alt');
            current_stream_tag.value.classList.add('fade-in');
          }
        }
  
      // }
    }

  })


  function click_test() {
    streamText()
  }


  function click_test2() {
  }


  function create_new_map(input) {
console.log('create_new_map: ', input)
  } 

















  function getLastTokenWithParent(dict) {
    let parentType = null;
    let parent_id = null;
    let last_word = null;
    let last_id = null;
    let lastTokenWithId = null;
    let previousDict = null;
    let very_first_id = null;
  
    very_first_id = dict.id
    while (dict && dict.tokens) {
      parentType = dict.type ?? null;
  
      if (dict.id) {
        lastTokenWithId = dict;
        last_id = dict.id;
  
        if (dict.tokens.length > 0) {
          let token_array = dict.tokens[dict.tokens.length - 1];
          last_word = token_array.to_stream[token_array.to_stream.length - 1];
        } else {
          last_word = dict.to_stream[dict.to_stream.length - 1];
        }
      }
  
      // Update parent_id with the id of the previous dict (the parent)
      parent_id = previousDict?.id || null;
  
      // Update previousDict before moving to the next token dictionary
      previousDict = dict;
      dict = dict.tokens[dict.tokens.length - 1];
    }
  
    return { very_first_id, last_id, last_word, parent_id, lastToken: lastTokenWithId, parentType };
  }
  

  const addIdToTag = (html, tagName, args) => {
    let val = ''
    val = html.replace(/<([a-zA-Z0-9]+)([^>]*)>/, `<$1 id="${args[0].id}"$2>`);
    stream_idx.value += 1
    return val
  };

  const customLexer = (markdown) => {
    let idx = 0;
    const tokens = marked.lexer(markdown);
    const stored_ids = { value: [] };
    const processTokens = (tokens) => {
      tokens.forEach((token) => {

        if (['heading', 'paragraph', 'strong', 'em'].includes(token.type)) {
          token.id = `${token.type}-${idx}`;
          stored_ids.value.push(token.id);
            token.text=''          
          idx += 1;
        }
        if (token.type !== 'space') {
          token.to_stream = token?.text.trim().split(' ') || '';
          token.to_stream = token.to_stream.map((item, index) => index === 0 ? item : ` ${item}`);  
        }

        if (token.tokens && Array.isArray(token.tokens)) {
          processTokens(token.tokens);
        }
      });
    };

    processTokens(tokens);
    return tokens;
  };


  function init_md_parser() {
    const renderer = new marked.Renderer();
    const block_level = ['space', 'code', 'blockquote', 'html', 'heading', 'hr', 'list', 'listitem', 'checkbox', 'paragraph', 'tablecell']
    const inline_level = ['strong', 'em', 'codespan', 'br', 'del', 'link', 'image'];
    const all_tags = block_level.concat(inline_level)

    all_tags.forEach((tag) => {
      const originalMethod = renderer[tag];
      if (originalMethod) {
        renderer[tag] = (...args) => {
          const html = originalMethod.call(renderer, ...args);
          return addIdToTag(html, tag, args);
        };
      }
    });

    marked.setOptions({
      langPrefix: "hljs language-",
      renderer: renderer
    });

  }


  onMounted(() => {
    // const container = document.getElementById('text-container2');
    // container.addEventListener('animationend', handleAnimationEnd);
    // init_md_parser()


    turndownService.value.escape = function (text) {
      return text.replace(/([\\`*{}[\]()#+.!-])/g, '\\$1'); // Keep only necessary escapes
    };

    turndownService.value.addRule('heading', {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      replacement: function (content, node) {
        var hLevel = node.nodeName.charAt(1);
        var hashes = new Array(parseInt(hLevel) + 1).join('#');
        var id = node.id ? ` {#${node.id}}` : '';
        return `\n\n${hashes} ${content}${id}\n\n`;
      }
    });

    apiClient
      .get("https://localhost:8002/v1/api/get_allowed_fields/")
      .then(response => {
        const obj = response.data['ctx']['fields']
        const result = {};
        let all_concat = [];
        let all_clt = []
        for (const key in obj) {
          if (Array.isArray(obj[key]?.all)) {
            obj[key].all.forEach(item => {
              all_clt.push(key)
              all_concat.push({ label: `${item}|${key}`, key: `${item}|${key}`, field: item, clt: key });
            });
          }
        }

        allowed_clt_fields.value = all_concat
        distinct_clt.value = [...new Set(all_clt)];
        // selected_clt.value = distinct_clt.value[0]
        selected_clt.value = 'NodeTest2'
      })


    async function fetchSchema(url) {
      return axios.get(url, {
          headers: { 'Content-Type': 'application/json' }
      }).then(response => {
          const schema = buildClientSchema(response.data);
          return schema;
      });
    }


  fetchSchema('https://localhost:8002/v1/api/schema3/').then(
    myGraphqlSchema => {
        graphql_shema.value = myGraphqlSchema
      })


  })


watch(() => [w_data.value],
    (new_data,old_data) => {
      if (dimension.value === 'hierarchy') {
          refresh_network.value = 'hierarchy'
        }
    });


watch(() => [d3_network_data.value],
(new_data, old_data) => {
    if (dimension.value === 'network') {
      refresh_network.value = 'network'
    } 
});


watch(() => dimension.value,
(new_data, old_data) => {
  if (conversation_history.value.at(-1)) {
    if (dimension.value === 'network' && is_object_dirty.value.d3_network_data) {
      fetch_data({...last_query.value, dimension: 'network'})
    } 
    if (dimension.value === 'hierarchy' && is_object_dirty.value.w_data) {
      fetch_data({...last_query.value, dimension: 'hierarchy'})
    } 
    if (dimension.value === 'data_table' && is_object_dirty.value.data_table) {
      fetch_data({...last_query.value, dimension: 'data_table'})
    } 
  }
});


  const popUpBoxStyle = computed(() => ({
    position: 'fixed',
    top: `${position.value.y}px`,
    left: `${position.value.x}px`,
    cursor: isDragging.value ? 'grabbing' : 'grab',
    userSelect: 'none',
    'z-index': 99999999999999
  }));


  function html_to_hierarchy(html) {
    console.log('html', html)

    //TODO: 

    if (header_prop_name.value === undefined) {
      header_prop_name.value = 'name'
    }
    
    apiClient
      .post("https://localhost:8002/v1/api/html_to_hierarchy/", { html: html, header_prop_name: header_prop_name.value })
      .then(response => {
        console.log('md_to_hierarchy', response.data)
        w_data.value = response.data.hierarchy
        is_object_dirty.value.w_data = false
      })
  }


  function set_dimension(dimension_to_set) {
    dimension.value = dimension_to_set
  }


  return {
    loading_flag,
    is_object_dirty,
    set_all_object_dirty,
    right_panel_message,
    note_click_event,
    show_llm_hist_box,
    is_comp_mounted,
    one_shot_home,
    APP_TYPE,

    is_menu_open,
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
    left_panel,
    create_new_map,

    set_dimension,

    // network
    refresh_network,
    d3_network_data,

    //tiptap editor
    html_content,
    md_content,
    show_refs,
    content_type,
    is_dirty,
    html_content_original,
    refresh_map,

    // thingsSpace
    things_space_option,
    things_space_data,

    // conversation
    stream_status,
    stream_content,
    user_input,
    selected_clt,
    conversation_history,
    conv_full_screen,
    llm_message,

    // graphql
    code,
    graphql,
    graphql_input,
    graphql_output,
    run_graphql_query,

    //popup box
    isVisible,
    position,
    isDragging,
    lastPosition,
    popUpBoxStyle,
    shared_popup_text,


    turndownService,
    html_to_hierarchy,

    allowed_clt_fields,

    click_test,
    click_test2,

    // data table
    full_mode,
    data_table,
    header_prop_name,



    fetch_data,
    bus_event,

    // save
    transaction_list,
    refresh_save_page,

    // left drawer
    is_left_drawer_open,
    graphql_shema


  }

})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(dimStore, import.meta.hot))
}