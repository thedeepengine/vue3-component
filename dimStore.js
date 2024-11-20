import axios from 'axios'
import { ref, onMounted, watch, computed } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import TurndownService from 'turndown';
import { test_click_utils } from '@/components_shared/utils'
import { marked } from "marked";

export const dimStore = defineStore("dimStore", () => {
  // const is_menu_open = ref(true)
  // const dimension = ref('menu')
  // const left_panel = ref('loading')

  const is_menu_open = ref(false)
  const dimension = ref('hierarchy')
  const left_panel = ref('markdown')

  
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
  const shared_popup_text = ref()

  const turndownService = ref(new TurndownService());
  const isAnimatingNew = ref(false)

  const allowed_clt_fields = ref({})

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
  const is_full_screen = ref(false);

  
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
    console.log('popped_uppopped_uppopped_uppopped_uppopped_uppopped_up: ', popped_up)
  }


  watch(() => text_chunk.value, (n, o) => {
    console.log('text_chunk.value', text_chunk.value)
    stream_queue.value.push(text_chunk.value)
    stream_accumulated.value += text_chunk.value + ' '
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
    // text_tracker.value = []


    const processTokens = (tokens) => {
      tokens.forEach((token) => {
        console.log('token', token)
        // Assign unique ID and to_stream field, then clear text

        if (['heading', 'paragraph', 'strong', 'em'].includes(token.type)) {
          token.id = `${token.type}-${idx}`;
          stored_ids.value.push(token.id);

          // if (text_tracker.value[idx] !== undefined) {
            // token.text = text_tracker.value[idx]
          // } else {
            token.text=''
          // }
          
          idx += 1;
        }

        // if (token.type === 'text') {
        //   token.text=''
        // }
        if (token.type !== 'space') {
          token.to_stream = token?.text.trim().split(' ') || '';
          token.to_stream = token.to_stream.map((item, index) => index === 0 ? item : ` ${item}`);  
        }

        if (token.tokens && Array.isArray(token.tokens)) {
          processTokens(token.tokens);
        }
      });
    };

    // tokens[tokens.length-1].

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

    console.log('marked', marked)

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
        for (const key in obj) {
          if (Array.isArray(obj[key]?.all)) {
            obj[key].all.forEach(item => {
              all_concat.push({ label: `${item}|${key}`, key: `${item}|${key}`, field: item, clt: key });
            });
          }
        }

        allowed_clt_fields.value = all_concat
      })
  })

  watch(() => user_input.value, (newValue, oldValue) => {
    newValue='name=test>>name,name,content,hasChildren:name,content,hasOntology:name,content'
    fetch_data('NodeTest2', newValue)
  })

  watch(() => dimension.value, (newValue, oldValue) => {
    // fetch_data('NodeTest2', user_input.value)

    newValue='name=test>>name,name,content,hasChildren:name,content,hasOntology:name,content'
    fetch_data('NodeTest2', newValue)
  })

  watch(() => [things_space_data.value, dimension.value],
    ([new_data, new_dimension], [old_data, old_dimension]) => {
      console.log('new_dimension', new_dimension)
      if (new_dimension === 'things_space') {
        // if (new_data !== undefined) {
        new_data = [{}]
        console.log('new_data', new_data)
        let reduced = getThingSpace(new_data)
        things_space_option.value = things_space_options(reduced)
        console.log('things_space_option.value', things_space_option.value)
        // }
      }
    }
  );


watch(() => [data_table.value, dimension.value],
([new_data, new_dimension], [old_data, old_dimension]) => {
    // Object.assign(tableData, dim_store.datatable);
    // data_table.value.data.splice(0, data_table.value.data.length, data_table.value.data);
});

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



  const popUpBoxStyle = computed(() => ({
    position: 'fixed',
    top: `${position.value.y}px`,
    left: `${position.value.x}px`,
    cursor: isDragging.value ? 'grabbing' : 'grab',
    userSelect: 'none',
    'z-index': 99999999999999
  }));


  function md_to_hierarchy(md) {
    apiClient
      .post("https://localhost:8002/v1/api/md_to_hierarchy/", { md: md })
      .then(response => {
        console.log('md_to_hierarchy', response.data)
        w_data.value = response.data.hierarchy
      })
  }

  function fetch_data(clt, request) {

    if (request === '') {
      request = 'name,vector,hasChildren:name'
    }

    apiClient
      .post("https://localhost:8002/v1/api/query/", { clt: clt, request: request, dimension: dimension.value })
      .then(response => {
        if (response.data?.d3) w_data.value = response.data.d3
        if (response.data?.d3_network_data) d3_network_data.value = response.data.d3_network_data
        if (response.data?.md) md_content.value = response.data.md
        if (response.data?.things_space) things_space_data.value = response.data.things_space
        if (response.data?.graphql) {
          let graphql = response.data.graphql
          code.value = JSON.stringify(graphql, null, '\t')
        }
        if (response.data?.data_table) data_table.value = response.data.data_table
  
        
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
      series: [{
        type: 'scatter3D',
        label: {
          show: true,
          fontSize: 10,
          formatter: function (value) {
            return value['name'];
          },
        },
        data: [[1, 1, 1]]
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
    popUpBoxStyle,
    shared_popup_text,


    turndownService,
    md_to_hierarchy,

    allowed_clt_fields,

    click_test,
    click_test2,

    // data table
    is_full_screen,
    data_table,



    fetch_data
  }

})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(dimStore, import.meta.hot))
}