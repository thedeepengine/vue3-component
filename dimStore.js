import axios from 'axios'
import { ref, onMounted, watch, computed } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import TurndownService from 'turndown';
import { test_click_utils } from '@/components_shared/utils'
import { marked } from "marked";

export const dimStore = defineStore("dimStore", () => {
  const is_menu_open = ref(true)
  const dimension = ref('menu')
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

  const left_panel = ref('loading')

  const custom_renderer = ref()

  // network
  const refresh_network = ref()
  const d3_network_data = ref({})

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
  const shared_popup_text = ref()

  const turndownService = ref(new TurndownService());
  const isAnimatingNew = ref(false)

  const allowed_clt_fields = ref({})

  const text_chunk = ref('')
  const stream_queue = ref([])
  const stream_accumulated = ref('')
  const stored_ids = ref([])
  const stored_tags = ref([])
  const current_stream_tag = ref([])
  const text_tracker = ref([])

  // data table
  const data_table = ref()
  const is_full_screen = ref(false);

  
  function streamText(md) {
    // const markdown = '# Main Heading\n\nthis is a paragraph\n## Subheading with **bold** text\n\nThis is a paragraph with a [link](https://example.com).';
    // const markdown = '# Main Heading\n\nthis is a paragraph\n';
    // const markdown = '# Main this is a tiltle with some custom text\n\nsimple paragraph';
    // const markdown = '# Main this **thats bold** \n\n simple paragraph';
    // const markdown = '# Main this _thats bold_ \n\n simple paragraph';
    // const markdown = '# Here is a title which is so nice _thats italic_';
    // const words = ['#', ' Here', ' is', ' a', ' title', ' which', ' is', ' so', ' nice', ' _thats', ' italic_', '\n\n', 'thast', 'a', 'paragraph'];

    // const words = ['#', ' Here', ' is', ' a', ' title', ' which', ' jjjj', '\n\n', 'thast', 'a', 'paragraph'];
    // let words = ['###', ' Here', ' is', ' a', '_title', ' which_', ' jjjj', '\n\n', 'thast', 'a', 'paragraph'];
    // words = words.concat('also her is a s fudsi fdhi fdsuf dsuf idufhds iufhdif dsf dfyd fyd'.split(' '))
    // words = words.concat('\n\n also her is a s fudsi fdhi fdsuf \n\n dsuf idufhds iufhdif dsf dfyd fyd'.split(' '))

    // const words = ['# this ', 'is ', 'a ', 'title ', 'here ', 'as ', 'it ', 'has ', 'to ', 'be ', 'ordered '];
    let words = md.trim().split(' ')
    let text = '';
    let i = 0

    const interval = setInterval(() => {
      text += words[i]
      text_chunk.value = words[i]

      i += 1;

      if (i >= words.length) {
        clearInterval(interval);
      }
    }, 50);
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


  watch(() => stream_accumulated.value, (n, o) => {
    console.log('stream_queue.value[0]', stream_queue.value[0])
    if (stream_queue.value[0] === '\n' || stream_queue.value[0] === '\n\n') {
      let popped_up = stream_queue.value.shift()
      console.log('SKIPED :', popped_up)
    } else if (stream_queue.value[0] !== undefined && stream_queue.value.length > 0) {
      console.log('STREAM QUEUE: =======================', stream_queue.value[0])
      console.log('PROCESSED STRING: =======================', stream_accumulated.value)
      
      const { tokens, container, content } = customLexer(stream_accumulated.value)
      let parsed;
      if (container.type === 'list_item') {
        console.log('renderer.value', custom_renderer.value)
        console.log('container', container)
        parsed = custom_renderer.value.listitem(container)
      } else {
        parsed = marked.parser(container)
      }

        let parent_elt_name = container?.parent_id ? container.parent_id : 'text-container2'
        let parent_elt = document.getElementById(parent_elt_name);
        console.log('PARENT NAME : ', parent_elt_name)
        console.log('PARENT ELEMENT : ', parent_elt)
        if (!parent_elt) {
          let root_elt = document.getElementById('text-container2');
          container.parent.items = []
          container.parent.tokens = []

          parsed = marked.parser([container.parent])
          console.log('parsed parent', parsed)
          root_elt.insertAdjacentHTML('beforeend', parsed)
          parent_elt =  document.getElementById(parent_elt_name);
        }

        let container_elt = document.getElementById(container.id);

        if (!container_elt) {
          console.log('renderer.value', custom_renderer.value)
          console.log('container', container)
          if (container.type === 'list_item') {
            parsed = custom_renderer.value.listitem(container)
          } else {
            parsed = marked.parser([container])
          }

          console.log('parsedparsedparsedparsedkkkkkkk', parsed)

          parent_elt.insertAdjacentHTML('beforeend', parsed)
          container_elt = document.getElementById(container.id);
          console.log('NEWLY ASSIGNED CONTAINER ELEMENT ID: ', container.id)
          console.log('NEWLY ASSIGNED CONTAINER ELEMENT : ', container_elt)
        } 

        if (content.to_stream) {
          const span_elt = document.createElement('span');
          span_elt.textContent = content.to_stream + ' ';
          span_elt.classList.add('word');
          container_elt.appendChild(span_elt);
          span_elt.style.animationDelay = `0.1s`;
        } 

        let popped_up = stream_queue.value.shift()
      // if (last_token.last_id === last_g.id) {
      //   const tag_elt = document.getElementById(last_token.last_id);
      //   tag_elt.classList.add('dynamic-div');
      //   current_stream_tag.value = tag_elt
      //   console.log('CURRENT TAG SET ========', current_stream_tag.value)
      // } else {
      //   console.log('NESTED ITEM NEED FULL CURRENT UPDATE')
      //   let to_remove = document.getElementById(last_g.id);
      //   root.removeChild(to_remove);
      //   console.log('parsed NESTED: ', parsed)
      //   root.insertAdjacentHTML('beforeend', parsed)
      //   let popped_up = stream_queue.value.shift()
      //   console.log('popped_uppopped_uppopped_uppopped_uppopped_uppopped_up: FROM NESTED ', popped_up)
      // }
  
  
      //   console.log('LAST WORD ========== ', last_token.last_word)
      //   if (last_token.last_word !== null && last_token.last_word !== undefined) {
      //     isAnimatingNew.value = true
      //     console.log('LAST WORD TO ENTER ======= ', last_token.last_word)
      //     current_stream_tag.value.setAttribute('data-new-word', last_token.last_word);
  
  
  
      //     if (current_stream_tag.value.classList.contains('fade-in')) {
      //       current_stream_tag.value.classList.remove('fade-in');
      //       current_stream_tag.value.classList.add('fade-in-alt');
      //     } else {
      //       current_stream_tag.value.classList.remove('fade-in-alt');
      //       current_stream_tag.value.classList.add('fade-in');
      //     }
      //   }
  
      // }
    }

  })


  // let md = "# this is a title\nthis is a paragraph\n1. point aaaaa\n2. point bbbb"

  // let md = "# this is a title\nthis is a paragraph\n1. point **aaaaa**"

  // let md = "# this is a title\nthis is a paragraph\n1. point **aaaaa**\n"

  // let md = "# ddddd"


  // let md = `# fdsfdfdsf
  // fdsifd siofdjosfid
  // 1. aaaaa
  // 2. bbbb`

    let md = `# thats a title fds fds fidjf ds fd sfdi fdsif dfid fdisfd`


  function click_test() {
    streamText(md)
  }


  function click_test2() {
    const { tokens, last_elt, container, content } = customLexer(md)
    console.log('tokens: ', tokens)
    console.log('container :', container)
    console.log('content :', content)
    console.log('last_elt :', last_elt)

    const renderer = new marked.Renderer();
    console.log('renderer', renderer)


    let parsed = marked.parser(tokens, { renderer: renderer }) 
    // console.log('parsed', parsed)

    console.log('tokens[0].items[0]: ', tokens[0].items[0])
    let a = renderer.listitem(tokens[0].items[0])
    console.log('aaa', a)
    parsed = marked.parser(tokens[0].items[0])
    console.log('parsedparsed', parsed)
    

  }


  function create_new_map(input) {
console.log('create_new_map: ', input)
  } 


  const customLexer = (markdown) => {
    let idx = 0;
    const tokens = marked.lexer(markdown);
    const stored_ids = { value: [] };
    let last_elt

    const processTokens = (tokens) => {
      tokens.forEach((token) => {

        if (['heading', 'paragraph', 'strong', 'em', 'list', 'list_item'].includes(token.type)) {
          token.id = `${token.type}-${idx}`;
          stored_ids.value.push(token.id);
          token.text=''
          last_elt = token
          idx += 1;
        }

        if (token?.text) {
          token.to_stream = token?.text.trim().split(' ') || '';
          token.to_stream = token.to_stream.map((item, index) => index === 0 ? item : ` ${item}`);  
        }

        if (token.tokens && Array.isArray(token.tokens)) {
          processTokens(token.tokens);
        }
        if (token.items && Array.isArray(token.items)) {
          processTokens(token.items);
        }
      });
    };

    processTokens(tokens);
    
    function getLastNestedItem(obj, typesList) {
      let current = obj;
      let container = obj;
      let lastAncestor = null;
    
      while (current?.tokens?.length || current?.items?.length) {
        const array = current.tokens?.length ? current.tokens : current.items;
        current = array[array.length - 1];
    
        if (typesList.includes(current.type)) {
          lastAncestor = container
          container = current;
        }
      }
    
      container.parent = lastAncestor || null;
      container.parent_id = lastAncestor?.id || null;
      return { content: current, container };
    }
    

    let last_token = tokens[tokens.length - 1]
    let finals = getLastNestedItem(last_token, ['heading', 'paragraph', 'strong', 'em', 'list', 'list_item'])
    if (finals.content?.text) {
      let split = finals.content.text.trim().split(' ')
      finals.content.to_stream = ' '+split.at(-1)
      finals.content.text = split.slice(0,-1).join(' ')  
    } else {
      finals.content.to_stream = ''
    }

    return { tokens, last_elt, container: finals.container, content: finals.content };
  };


  function init_md_parser() {
    const renderer = new marked.Renderer();
    const block_level = ['space', 'code', 'blockquote', 'html', 'heading', 'hr', 'list', 'listitem', 'checkbox', 'paragraph', 'tablecell']
    const inline_level = ['strong', 'em', 'codespan', 'br', 'del', 'link', 'image'];
    const all_tags = block_level.concat(inline_level)

    const addIdToTag = (html, tagName, args) => {
      let val = ''
      val = html.replace(/<([a-zA-Z0-9]+)([^>]*)>/, `<$1 id="${args[0].id}"$2>`);
      return val
    };
  
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




    const { tokens, last_elt, container, content } = customLexer('# ee')

    // const renderer_1 = new marked.Renderer();

    // let a = renderer.listitem(tokens[0].items[0])
    // parsed = marked.parser(tokens[0].items[0])

    let parsed = marked.parser(tokens, { renderer: renderer }) 

    custom_renderer.value = renderer

    console.log('renderer.value', custom_renderer.value)

  }



























  onMounted(() => {
    const container = document.getElementById('text-container2');
    // container.addEventListener('animationend', handleAnimationEnd);
    init_md_parser()
     





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