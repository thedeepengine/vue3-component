import axios from 'axios'
import { ref, onMounted, watch, computed } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import TurndownService from 'turndown';
import { test_click_utils } from '@/components_shared/utils'
import { marked } from "marked";

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

  function streamText() {
    // const markdown = '# Main Heading\n\nthis is a paragraph\n## Subheading with **bold** text\n\nThis is a paragraph with a [link](https://example.com).';
    // const markdown = '# Main Heading\n\nthis is a paragraph\n';
    const markdown = '# Main this is a tiltle with some custom text';

    const words = markdown.trim().split(' ');
    // const words = ['# this ', 'is ', 'a ', 'title ', 'here ', 'as ', 'it ', 'has ', 'to ', 'be ', 'ordered '];
    let text = '';
    let i = 0

    const interval = setInterval(() => {
      text += words[i] + ' ';
      text_chunk.value = words[i]

      i += 1;

      if (i >= words.length) {
        clearInterval(interval);
      }
    }, 300);
  }

  function handleAnimationEnd(event) {
    const container = document.getElementById('text-container');
    const word = container.getAttribute('data-new-word');
    const currentText = container.textContent;
    container.textContent = currentText ? currentText + word : word;
    container.setAttribute('data-new-word', '');
    isAnimatingNew.value = false
  }


  watch(() => text_chunk.value, (n, o) => {
    // console.log('text_chunk.value', text_chunk.value)
    stream_queue.value.push(text_chunk.value)
    stream_accumulated.value += text_chunk.value+' '
  })


  function getLastTokenWithParent(dict) {
    let parentType = null;
    let parent_id = null;
  
    while (dict && dict.tokens && dict.tokens.length > 0) {
      parentType = dict.type ?? null; // Store the current type as parent type
      parent_id = dict.id
      dict = dict.tokens[dict.tokens.length - 1];
    }
  
    return { lastToken: dict, parentType };
  }
  watch(() => [stream_queue.value[0], isAnimatingNew.value], (n, o) => {
    stream_idx.value=0
    const g = customLexer(stream_accumulated.value)
    let last_g = g[g.length-1]
    let t = getLastTokenWithParent(last_g)
  
    let parsed = marked.parser(g)
    console.log('parsed: ', parsed)

    console.log('t.lastToken.id: ', t.lastToken.id)
    console.log('t.lastToken.id: ', stored_ids.value[stored_ids.value.length-1])

    if (t.lastToken.id !== stored_ids.value[stored_ids.value.length-1] && !t.lastToken.id.startsWith('text')) {
      console.log('NEW TAG ========')
      stored_ids.value.push(t.lastToken.id)
      console.log('last parent:', t?.parent_id)
      let container2
      if (t?.parent_id === undefined) {
        container2 = document.getElementById('text-container2');
      } else {
        container2 = document.getElementById(t.parent_id);
      }
      container2.innerHTML = parsed
      const tag_elt = document.getElementById(t.lastToken.id);
      current_stream_tag.value = tag_elt
      // console.log('last_ct_id=++++++++++++++++++++++\n', last_ct_id)
    } 

    current_stream_tag.value.textContent+='a'

    



    if (!isAnimatingNew.value && stream_queue.value.length > 0) {
      isAnimatingNew.value = true
      const container = document.getElementById('text-container');
      const word_n = stream_queue.value.shift();
      container.setAttribute('data-new-word', word_n);

      if (container.classList.contains('fade-in')) {
        container.classList.remove('fade-in');
        container.classList.add('fade-in-alt');
      } else {
        container.classList.remove('fade-in-alt');
        container.classList.add('fade-in');
      }
    }
  })

  const addIdToTag = (html, tagName, args) => {
    console.log('args===', args)
    // const customId = `${tagName}-${Math.random().toString(36).substr(2, 9)}`;
    // stream_idx.value.push(customId)
    let val = ''

    //   val = ''
    // } else {
      // stored_tags.value.push(customId.split('-')[0])
      val = html.replace(/<([a-zA-Z0-9]+)([^>]*)>/, `<$1 id="${args[0].id}"$2>`);
    // }
    stream_idx.value+=1
    return val
  };

  // const customLexer = (markdown) => {
  //   let idx = 0
  //   const tokens = marked.lexer(markdown);
  //   tokens.forEach(token => {
  //     console.log(';;;', token)
  //     // token.id = `${token.type}-${Math.random().toString(36).substr(2, 9)}`;
  //     token.id = `${token.type}-${idx}`;
  //     token.to_stream = token.text
  //     token.text = ''
  //     stored_ids.value.push(token.id)
  //     idx+=1
  //   });
  //   return tokens;
  // };


  const customLexer = (markdown) => {
    let idx = 0;
    const tokens = marked.lexer(markdown);
    const stored_ids = { value: [] };
  
    const processTokens = (tokens) => {
      tokens.forEach((token) => {
        // Assign unique ID and to_stream field, then clear text

        // if (['heading', 'paragraph', 'strong', 'em'].includes(token.type))
        token.id = `${token.type}-${idx}`;
        token.to_stream = token?.text.split(' ') || '';
        token.text = '';
        stored_ids.value.push(token.id);
        idx += 1;
  
        // Recursively process nested tokens if they exist
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

    // const lexer = new marked.Lexer();
    // const originalLex = lexer.lex;

    // lexer.lex = function (src) {
    //   const tokens = originalLex.call(this, src);
    //   tokens.forEach(token => {
    //     console.log('Token:', token);
    //     token.id = `${token.type}-${Math.random().toString(36).substr(2, 9)}`;
    //   });

    //   return tokens;
    // };

    // marked.use({ lexer: lexer });

    const markdown = 'This is normal text. !custom This should be a custom token.';
    const tokens = customLexer(markdown);
    console.log('tokens', tokens)
    const html = marked.parser(tokens);

  }


  function click_test() {
    streamText()


    // console.log(customLexer(`# ffff`))
    // console.log(customLexer(`# ffff *aaaa*`))
    // console.log(customLexer(`# ffff *aaaa* hhhhh`))
    // console.log(customLexer(`# ffff *aaaa* hhhhh\n\n pajfds`))

  }























  onMounted(() => {
    const container = document.getElementById('text-container');
    // container.addEventListener('transitionend', handleTransitionEnd);
    container.addEventListener('animationend', handleAnimationEnd);

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
    popUpBoxStyle,
    shared_popup_text,


    turndownService,
    md_to_hierarchy,

    allowed_clt_fields,

    click_test
  }

})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(dimStore, import.meta.hot))
}