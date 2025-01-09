import axios from 'axios'
import { drag as d3drag } from 'd3-drag'
import { forceSimulation as d3forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { select as d3select, selectAll as d3selectAll, selection as d3selection } from 'd3-selection'
import { linkHorizontal, line as d3line } from 'd3-shape'
import { transition } from 'd3-transition'
import { toRaw } from 'vue';
import { hierarchy, tree } from 'd3-hierarchy'
import { highlight_new_node, insert_object_at_uuid, find_parent_uuid, assign_tree_side_and_order, restructure_tree } from '@/components_shared/utils'

const NODE_MIN_WIDTH = 50
const stroke = "#555";
const strokeWidth = 1.5;
const strokeOpacity = 1;
const SPACE_WIDTH = 16
const SPACE_HEIGHT = 16

let store = null

function set_store(val) {
    console.log('set store: ', val)
   store = val
}

const apiClient = axios.create({
    baseURL: 'https://localhost:8002/',
    headers: {
      'Content-Type': 'application/json'
    }
  });



let arrow_filled_up = '<g><circle cx="256" cy="256" r="256" fill="#f9f7f5"></circle><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM377 271c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-87-87-87 87c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9L239 167c9.4-9.4 24.6-9.4 33.9 0L377 271z" fill="#1f2937"/></g>'
let arrow_filled_down = '<g><circle cx="256" cy="256" r="256" fill="#f9f7f5"></circle><path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM135 241c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l87 87 87-87c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L273 345c-9.4 9.4-24.6 9.4-33.9 0L135 241z" fill="#1f2937"/></g>'
let arrow_filled_right = '<circle cx="256" cy="256" r="256" fill="#f9f7f5"></circle><path d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM241 377c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l87-87-87-87c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L345 239c9.4 9.4 9.4 24.6 0 33.9L241 377z" fill="#1f2937"/>'
let arrow_filled_left = '<g><circle cx="256" cy="256" r="256" fill="#f9f7f5"></circle><path d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM271 135c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-87 87 87 87c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L167 273c-9.4-9.4-9.4-24.6 0-33.9L271 135z" fill="#1f2937"/></g>'
let add_icon = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M5 6a1 1 0 0 1 1-1h2a1 1 0 0 0 0-2H6a3 3 0 0 0-3 3v2a1 1 0 0 0 2 0V6ZM5 18a1 1 0 0 0 1 1h2a1 1 0 1 1 0 2H6a3 3 0 0 1-3-3v-2a1 1 0 1 1 2 0v2ZM18 5a1 1 0 0 1 1 1v2a1 1 0 1 0 2 0V6a3 3 0 0 0-3-3h-2a1 1 0 1 0 0 2h2ZM19 18a1 1 0 0 1-1 1h-2a1 1 0 1 0 0 2h2a3 3 0 0 0 3-3v-2a1 1 0 1 0-2 0v2Z" fill="#222F3D"/></svg>'

d3selection.prototype.setAttrs = function (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
        this.attr(key, value);
    });
    return this;
};

d3selection.prototype.setStyles = function (styles) {
    Object.entries(styles).forEach(([key, value]) => {
        this.style(key, value);
    });
    return this;
};



var adjust_tree_x = function (root_left, root_right) {
    if (Object.keys(root_left).length === 0) return; // quit if root_left is empty as no adjustment is needed

    var diff_right = root_right.x
    var diff_left = root_left.x
    root_right.descendants().map(item => { item.x -= diff_right })
    root_left.descendants().map(item => { item.x -= diff_left })
}

function empty_static_tree() {
    d3selectAll(".front_text_container .node_text").remove()
    d3selectAll(".underlined_path_container .link").remove()
    d3selectAll(".link_container .link").remove()
    d3selectAll(".link_container .link2").remove()
}

function empty_force_tree() {
    d3selectAll("#forcedtree g.back_node_container").remove()
    d3selectAll("#forcedtree g.back_text_container").remove()
    d3selectAll("#forcedtree g.back_link_container").remove()
}

const TREE_UPDATE_DURATION = 0

function draw_path_tree(root_nodes, root_links) {

    var linkContainer = d3select(".link_container")
    var underlinedPath = d3select(".underlined_path_container")

    linkContainer
        .setAttrs({ fill: "none", stroke: stroke, "stroke-opacity": strokeOpacity, "stroke-linecap": null, "stroke-linejoin": null, "stroke-width": strokeWidth })
        .selectAll(".link2")
        .data(root_links, function (d) { return d.source.data.uuid_front + '' + d.target.data.uuid_front })
        .join(
            enter => enter.append("path")
                .attr("class", "link2")
                .attr("d", linkHorizontal()
                    .source(d => ({ ...d.source, 'type': 'source' }))
                    .target(d => ({ ...d.target, 'type': 'target' }))
                    .x(d => {
                        if (d.type === 'source' & d.side === 'right' & d.depth === 0) {
                            return d.y_end
                        } else if (d.type === 'target' & d.side === 'right' & d.depth > 0) {
                            return d.y_start
                        } else if (d.type === 'source' & d.side === 'left') {
                            return d.y_start
                        } else {
                            return d.y_end
                        }
                    })
                    .y(d => d.x))
                .style('opacity', 1),
            update => update
                .transition()
                .duration(TREE_UPDATE_DURATION)
                .attr("d", linkHorizontal()
                    .source(d => ({ ...d.source, 'type': 'source' }))
                    .target(d => ({ ...d.target, 'type': 'target' }))
                    .x(d => {
                        if (d.type === 'source' & d.side === 'right' & d.depth === 0) {
                            return d.y_end
                        } else if (d.type === 'target' & d.side === 'right' & d.depth > 0) {
                            return d.y_start
                        } else if (d.type === 'source' & d.side === 'left') {
                            return d.y_start
                        } else {
                            return d.y_end
                        }
                    })
                    .y(d => d.x)),
            exit => exit
                .transition()  // Start transition for exit selection
                .duration(500)  // Duration of 500ms
                .style('opacity', 0)  // Fade out to opacity 0
                .remove()  // Remove after transition
        )


    const d3linew = d3line()
        .x(d => d[0])
        .y(d => d[1]);

    let r = root_nodes
        .map(d => ({ uuid_front: d.data.uuid_front, coord: ([[d.y_end, d.x], [d.y_start, d.x]]) }))

    underlinedPath
        .attr("stroke", stroke)
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke-width", strokeWidth)
        .selectAll(".link")
        .data(r,
            function (d) { return d.uuid_front })
        .join(
            enter => enter.append("path")
                .attr("class", "link")
                .attr("d", d => d3linew(d.coord)),
                // .each(function (d) {
                //     console.log("Entering:", d); // Logs data for entering elements
                // }),
            update => update
                .transition()  // Start a transition for update selection
                .duration(TREE_UPDATE_DURATION)
                .attr("d", d => d3linew(d.coord)),
                // .each(function (d) {
                //     console.log("Updating:", d); // Logs data for updating elements
                // }),
            exit => exit
                // .each(function (d) {
                //     console.log("Exiting:", d); // Logs data for exiting elements
                // })
                .transition()
                .duration(300)
                .remove()
        );
}

function displayStaticTree(store) {
    console.log('store.w_data---- ', store.w_data)
    if (store.w_data !== null && Object.keys(store.w_data).length > 0) {
        let { root_nodes, root_links } = compute_tree(store)
        draw_path_tree(root_nodes, root_links)
        draw_text_tree(store)
    }
}




























function draw_text_tree(store) {

    console.log('store.root_nodes::: ', store.root_nodes)
    let d3sel = d3select(".front_text_container").selectAll(".node_text")
    let rr = d3sel
        .data(store.root_nodes, d => d.data.uuid_front); // Using a key function based on uuid

    let AREA_EXTRA = 20
    let node_width = d => { return `${Math.max(d.y_end - d.y_start, NODE_MIN_WIDTH )}px` }
    let node_width2 = d => { return `${Math.max(d.y_end - d.y_start, NODE_MIN_WIDTH)}px` }
    let node_height = d => { return `${d.x_height}px` }

    rr.enter()
        .filter(d => d.data.uuid !== 'SPECIFIC_UUID_X')
        .append('foreignObject')
        .each(function (d) {

            let foreignObject = d3select(this)
                .setAttrs({overflow: 'visible', 'data-pathid': d => d.data.uuid_front })
                .attr("class", d => {
                    if (d.depth === 0) return `node_text`
                    else if (d.side === 'left') return `node_text left-sided`
                    else if (d.side === 'right') return `node_text right-sided`
                })
                .attr("transform", d => { return `translate(${d.y_start},${d.x - d.x_height})` })
                .style('width', node_width)
                .style('height', node_height)
                
            let body = foreignObject.append('xhtml:body')
                    .setStyles({ margin: 0, padding: 0, 
                        'font-size': '12px', 'line-height': '1', 
                        'min-height': '10px', 'background-color': 'transparent', 
                        'width': node_width, 'background': 'transparent'})
                    .on('click', function (event) {
                        event.preventDefault();
                        event.stopPropagation()
                    })
            
                body.append('textarea')
                    .attr('class', 'fmw-textarea')
                    .setAttrs({ value: d => { return d.data[store.header_prop_name] }, type: 'text', 'background-color': 'transparent', background: 'transparent' })
                    .attr('style', d => { return `resize:none;overflow-y: hidden;border: none; outline: none; font-size: 12px; padding: 0; font-family: inherit; box-sizing: border-box;background-color:transparent` })
                    // .style('justify-items', d => {return d.depth === 0 ? 'center': ''})
                    .style('width', node_width2)
                    .style('height', node_height)
                    .style('max-width', '100px')
                    .style('line-height', '1')
                    .style('font-family', 'inherit')
                        .on('input', function (event) {
                            let uuid_front = this.__data__.data.uuid_front
                            let value = event.srcElement.value
                            update_node_property(store.w_data, uuid_front, 'name', value)
                            displayStaticTree(store)
                            d3select(`#${uuid_front}`).text(value)
                        })
                        .on('keydown', function (event) {
                            if (event.key === 'Enter') {
                                update_node_property(store.w_data, this.__data__.data.uuid_front, 'name', this.value)
                                displayStaticTree(store)
                            }
                        })
                        .on('click', function (event) {
                            event.preventDefault();
                            event.stopPropagation()
                        })
                        .on('dblclick', function () {
                            this.disabled = false;
                            this.focus();
                        })

            body.filter(d => d.depth > 0 && d.side === 'right')
                .append('xhtml:div')
                .attr('class', 'hover-trace hover-trace-right')
                .html(add_icon)

            body
                .filter(d => d.depth > 0 && d.side === 'left')
                .append('xhtml:div')
                .attr('class', 'hover-trace hover-trace-left')
                .html(add_icon)
            
                
            d3selectAll('.hover-trace')
                .on('click', (event, data) => { 
                    show_map_menu(store.w_data, data)
                 })
        })
        // .each(function(d) { console.log('adding ++++++:', d.data.uuid_front); });  

    rr
    .filter(d => d.data.uuid !== 'SPECIFIC_UUID_X')
        .attr('data-pathid', d => d.data.uuid_front)
        .attr("class", d => {
            if (d.depth === 0) return `node_text`
            else if (d.side === 'left') return `node_text left-sided`
            else if (d.side === 'right') return `node_text right-sided`
        })
        .select('.fmw-textarea')
          .property('value', d => {
                return d.data[store.header_prop_name];
            })  
            // .attr('value', d => {console.log('d.data[store.header_prop_name]', d.data[store.header_prop_name]); return d.data[store.header_prop_name]})
            
        rr
            .transition()
            // .duration(TREE_UPDATE_DURATION)
            .attr("transform", d => `translate(${d.y_start},${d.x - d.x_height})`)
            // .attr("transform", d => `translate(${d.y_start},${d.x})`)
            .style('width', node_width)
            .style('height', node_height)
        .select('body')
            .style('width', node_width)
            .style('height', node_height)
        .select('.fmw-textarea')
            .attr("transform", d => `translate(${d.y_start},${d.x - d.x_height})`)
            // .attr("transform", d => `translate(${d.y_start},${d.x})`)
            .style('width', node_width2)
            .style('height', node_height)
            
            // .style('width', '100px')
            // .style('height', '100px')
        // .each(function(d) { console.log('updating:', d.data.uuid_front); });  

    rr.select('.hover-trace')
        .attr("class", d => {
            if (d.depth === 0) return
            else if (d.side === 'left') return `hover-trace hover-trace-left`
            else if (d.side === 'right') return `hover-trace hover-trace-right`
        })
        .html(add_icon)

    // .each(function(d) { console.log('updating:', d); });  

    rr.exit()
        // .each(function(d) { console.log('Exiting:', d); })
        .remove()
}


function remove_map_menu() {
    d3selectAll('.icon-menu')
    .transition()
    .duration(300)
    .style("opacity", 0).remove()
}

function update_node_property(obj, uuid, key, value) {
    if (Object.keys(obj).length > 0) {
        if (obj.uuid_front === uuid) {
            obj[key] = value;
            return true;
        }
    
        if (Array.isArray(obj.children)) {
            for (let child of obj.children) {
                if (update_node_property(child, uuid, key, value)) {
                    return true;
                }
            }
        }
        return false;
    } else {

    }
}


function show_icon_for_menu(event) {
    d3select('.menu-hover-rect').append('g')
        .attr('class', 'menu-icon')
        .html(add_icon)
        .attr('transform', event.target.attributes.transform.nodeValue)
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .style("opacity", 1)
}



function show_map_menu(hierarchy, data) {

    let ICON_SIZE = 18
    d3selectAll('.icon-menu')
        .remove()

    let current_transform = d3select('.global_tree_container').attr('transform');
    var match = /translate\(([^,]+),\s*([^)]+)\)/.exec(current_transform);
    let x = 0;
    let y = 0;

    if (match) {
        x = parseFloat(match[1]); 
        y = parseFloat(match[2]);
    }

    const icon_svg = d3select('.network_class svg')
        .append('g')
            .attr('class', 'icon-menu icon-menu-down')
            .style('transform', `translate(${x}px,${y - 10}px)`)
        .append('svg')
            .attr('x', data.side === 'right' ? data.y_start + (+data.y_end - data.y_start) / 2 - SPACE_WIDTH / 2 : data.y_end + (data.y_start - data.y_end) / 2 - SPACE_WIDTH / 2)
            .attr('y', data.x + 5)
            .attr('class', 'append-node-icon')
            .attr('width', ICON_SIZE)
            .attr('height', ICON_SIZE)
            .attr('viewBox', "0 0 512 512")

        d3select('.icon-menu-down').transition()
            .duration(300)
            .attr('opacity', 1)
            .style('transform', `translate(${x}px,${y}px)`)

    icon_svg.html(arrow_filled_down);

    if (data.side === 'right') {
        const icon_svg = d3select('.network_class svg')
        .append('g')
            .attr('class', 'icon-menu icon-menu-right')
            .style('transform', `translate(${x - 20}px,${y}px)`)
        .append('svg')
            .attr('x', data.y_end + 5)
            .attr('y', data.x - 14)
            .attr('class', 'append-node-icon')
            .attr('width', ICON_SIZE)
            .attr('height', ICON_SIZE)
            .attr('viewBox', "0 0 512 512")
            
        icon_svg.html(arrow_filled_right)

        d3select('.icon-menu-right').transition()
        .duration(300)
        .attr('opacity', 1)
        .style('transform', `translate(${x}px,${y}px)`)
        
    } else {
        const icon_svg = d3select('.network_class svg')
        .append('g')
            .attr('class', 'icon-menu icon-menu-left')
            .style('transform', `translate(${x + 20}px,${y}px)`)
        .append('svg')
            .attr('x', data.y_start - 25)
            .attr('y', data.x - 14)
            .attr('class', 'append-node-icon')
            .attr('width', ICON_SIZE)
            .attr('height', ICON_SIZE)
            .attr('viewBox', "0 0 512 512")
            


        icon_svg.html(arrow_filled_left)

        d3select('.icon-menu-left').transition()
        .duration(300)
        .attr('opacity', 1)
        .style('transform', `translate(${x}px,${y}px)`)

    }

    d3selectAll('.icon-menu-left').on('click', function () {
        handle_click_new_node(hierarchy, data, 'children')
    })
    
    d3selectAll('.icon-menu-right').on('click', function () {
        handle_click_new_node(hierarchy, data, 'children')
    })

    d3selectAll('.icon-menu-down').on('click', function () {
        handle_click_new_node(hierarchy, data, 'sibling')
    })
}


function handle_click_new_node(hierarchy, node_data, position) {
    let temp_uuid = Math.random().toString(36).substring(2, 7)
    let new_item = {uuid: temp_uuid, uuid_front: 'X_TEM_'+temp_uuid, name: ''}

    insert_object_at_uuid(new_item, hierarchy, node_data.data.uuid_front, position)

    let temp = hierarchy
    store.w_data = {}

    setTimeout(() => {
        store.w_data = temp
        highlight_new_node('X_TEM_'+temp_uuid, 'map')
    }, 300);

    store.update_md(temp, store.header_prop_name)
    remove_map_menu()
}


//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
////////// tree compute //////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

function compute_tree(store) {
    let { data_right, data_left } = compute_base_tree(store.w_data)

    let root_right = compute_side(data_right, "right")
    let root_left = compute_side(data_left, "left")

    root_right = draw_side_tree(store, root_right, "right")
    root_left = draw_side_tree(store, root_left, "left")
    adjust_tree_x(root_left, root_right)

    const root_nodes = [
        ...root_right.descendants(),
        ...(Object.keys(root_left).length === 0 ? [] : root_left.descendants())
      ];
    const root_links = [
        ...root_right.links(),
        ...(Object.keys(root_left).length === 0 ? [] : root_left.links())
      ];

    store.root_nodes = root_nodes
    store.root_links = root_links
    return { root_nodes, root_links }
}


function compute_base_tree(d) {
    let data_right = {}
    let data_left = {}
    if (d.children === undefined) {
        data_right = { name: d.name, uuid: d.uuid, uuid_front: d.uuid_front, side: 'center' }
        data_left = {}
    } else {

        let right, left;
        if (!('side' in d)) {
            assign_tree_side_and_order(d);
        }

        ({left,right} = restructure_tree(d));
        right = d.children.filter(x=>x.side === 'right')
        left = d.children.filter(x=>x.side === 'left')
        data_right = { 'name': d.name, uuid: d.uuid, uuid_front: d.uuid_front, 'children': right }
        data_left = { uuid: 'SPECIFIC_UUID_X', uuid_front: 'SPECIFIC_UUID_X_FRONT', 'children': left }
    }

    return { data_right, data_left }
}

function compute_side(data, side) {
    if (Object.keys(data).length === 0) return {};

    var way = side === "right" ? 1 : -1
    var root = hierarchy(data);
    tree()
        .nodeSize([20, way * 120])
        (root);

    var position_iter = function (items) {
        items.map(item => {
            if (item.parent !== null) {
                var x_array = item.parent.children.map(x => x.x)
                var mid_position = (Math.min(...x_array) + Math.max(...x_array)) / 2
                item.parent.x = mid_position
            }
        })
        var t = items.map(x => x.parent).filter(n => n)
        if (t.length > 0) position_iter(t)
    }

    // root.leaves().map((item, i) => { item.x = -10000 + i * 15 }) //!!!!!!!!!!
    root.leaves().map((item, i) => { item.x = 0 }) //!!!!!!!!!!
    position_iter(root.leaves()) 
    return root
}


function draw_side_tree(store, root, side) {
    if (Object.keys(root).length === 0) return hierarchy({});

    var SIDE_CONST = side === "right" ? 1 : -1
    var NODE_CLASS = "node_" + side
    const NODE_Y_SHIFT = 50
    const labels = root.descendants().map(d => d.data[store.header_prop_name]);
    let side_container = d3select(".global_tree_container ." + side + "_tree_container .node_container");

    var node_container = side_container
        .selectAll("." + NODE_CLASS)
        .data(root.descendants())
        .join("a")
        .attr('class', NODE_CLASS)


        console.log('root.descendants()', root.descendants())
    var node_text = //node_container
    d3select('#qwerty')
    .selectAll('div') 
    .data(root.descendants(), d => d.data.uuid_front)
    .join("div")
    .attr("class", 'fmw-hidden-size-computer')
    .attr('contenteditable', true)
    .setStyles({'line-height': '1', 'font-size': '12px', 'margin': 0, 'padding': 0})
    .attr('height', 3)
    .style('width', 'fit-content')
    .style('max-width', '100px')
    .property('value',(d, i) => labels[i])
    .text((d, i) => labels[i])

// compute text length.
// var text_length = node_text.nodes().reduce((prev, cur) => ({ ...prev, [cur.__data__.data[store.header_prop_name]]: Math.min(cur.getComputedTextLength() || 0, 100) }), {})
// var text_length = node_text.nodes().reduce((prev, cur) => ({ ...prev, [cur.__data__.data[store.header_prop_name]]: Math.min(cur.getComputedTextLength() + 10, 100) }), {})
// node_container.selectAll("text").remove();

console.log('node_text.nodes()---', node_text.nodes())

var ggg = node_text.nodes().reduce((prev, cur) => ({ ...prev, [cur.__data__.data[store.header_prop_name]]: cur.getBoundingClientRect() }), {})
// node_text.nodes().reduce((prev, cur) => console.log('cur.getBoundingClientRect()', cur), {})
// var x_height = node_text.nodes().reduce((prev, cur) => ({ ...prev, [cur.__data__.data[store.header_prop_name]]: cur.scrollHeight }), {})


// d3selectAll(".fmw-hidden-size-computer").remove();

// d3selectAll(".fmw-hidden-size-computer")
//   .filter(function(d, i, nodes) {
//     return i !== nodes.length - 1;
//   })
//   .remove();

console.log('GGGGGGGGG', ggg)

const x_height = {};
const text_length = {};

Object.keys(ggg).forEach(key => {
  const value = ggg[key];
  x_height[key] = value.height;
});

Object.keys(ggg).forEach(key => {
    const value = ggg[key];
    text_length[key] = Math.min(value.width, 100);
  });


    console.log('text_length', text_length)
    console.log('x_height', x_height)


    var rec_y_position = function (node) {
        if (node.depth === 0) { // initialisation for root node
            node.y_start = node.y
            node.y_end = node.y + Math.max(NODE_MIN_WIDTH, text_length[node.data[store.header_prop_name]])
            node.x_height = x_height[node.data[store.header_prop_name]]
            node.x = 0
        }

        if (node.children !== undefined) {

            for (const child of node.children) {
                child.y_start = (side === "right" ? child.parent.y_end : child.parent.y_start) + SIDE_CONST * NODE_Y_SHIFT + (side === "right" ? 0 : -Math.max(text_length[child.data[store.header_prop_name]], NODE_MIN_WIDTH))
                child.y_end = (side === "right" ? child.parent.y_end : child.parent.y_start) + SIDE_CONST * (NODE_Y_SHIFT + (side === "right" ? Math.max(text_length[child.data[store.header_prop_name]], NODE_MIN_WIDTH) : 0))
                child.x_height = x_height[child.data[store.header_prop_name]]
            }


            centerChildrenSymmetrically(0, 12, node.children);

    

            for (const child of node.children) {
                rec_y_position(child)
            }



        }
    }


    function centerChildrenSymmetrically(centralNodePosition = 0, centralNodeHeight, children) {
        console.log('============================== START================ START')
        const centralNodeMidpoint = centralNodeHeight / 2;
    
        const totalHeight = children.reduce((acc, child) => acc + child.x_height, 0);


        console.log('centralNodeMidpoint: ', centralNodeMidpoint)
        console.log('totalHeight: ', totalHeight)
        console.log('children.length: ', children.length)
        
        let cumulativeHeight = 0;    
        let starting = centralNodePosition - totalHeight/2
        console.log('starting: ', starting)
        if (children.length === 1) {
            children[0].x = centralNodePosition
        } else {
            for (let i = 0; i < children.length; i++) {
                cumulativeHeight += children[i].x_height;
                children[i].x = starting - centralNodeMidpoint + cumulativeHeight
                console.log('children[i].x:  ', starting - centralNodeMidpoint + cumulativeHeight)
                
                console.log('cumulativeHeight: ', cumulativeHeight)
            }
        }


        console.log('============================== END ==============END ')
    }


    
    
    rec_y_position(root)

    console.log('rootrootroot: ', root)

    root.descendants().map(item => item.side = side)

    if (side === 'right') {
        store.map_center = { ...store.map_center, text_length: text_length[labels[0]] }
        store.ontology_left_position = 0 + (text_length[labels[0]] / 2);
        d3select('.ontologyNameBackground')
            .attr("x", store.ontology_left_position)
            .text(store.ontology_name_selected);
    }
    return root
}

function calculateStrokeDashArray(width, height) {
    let widthGapRatio = 70 / 100
    const widthGap = width * widthGapRatio;
    const widthFull = (width * (1 - widthGapRatio)) / 2;
    let verticalGapRatio = 60 / 100
    const verticalGap = height * verticalGapRatio
    const verticalFull = (height * (1 - verticalGapRatio)) / 2;

    return `${widthFull},${widthGap},${widthFull + verticalFull},${verticalGap},${verticalFull + widthFull},${widthGap},${widthFull + verticalFull},${verticalGap},${verticalFull}`;
}

function getCorneredRectangle(x, y, width = 200, height = 50, strokeWidth = 2) {

    const strokeDashArray = calculateStrokeDashArray(width, height);

    var svgContainer = d3select("#popupbox").append("div")
        .setStyles({ left: x + "px", top: y + "px", position: "fixed", opacity: 0, "z-index": 999999999 })
        .attr("class", "svg-container-corner-rect")

    var svg = svgContainer.append("svg")
        .setAttrs({ id: 'corneredRectId', width: width + strokeWidth, height: height + strokeWidth })

    svg.append("rect")
        .setAttrs({
            x: 1, y: 1, fill: "none",
            width: width, height: height,
            stroke: "black", "stroke-width": strokeWidth, "stroke-dasharray": strokeDashArray
        })
        .style("position", "fixed")

    svg.append('text')
        .attr("class", "to-compute-text-length")
        .style("opacity", 0)
        .style("font-size", `12px`)

    svgContainer.transition().duration(300).style("opacity", 1);
}

function getFloatingTextBox(x, y, action_func = undefined, width = 200, content = '') {
    let strokeWidth = 2
    let fontSize = 12
    let height = fontSize + fontSize

    getCorneredRectangle(x, y, width, height, strokeWidth)

    var input = d3select(".svg-container-corner-rect")
        .append("input")
        .attr("type", "text")
        .style("position", "fixed")
        .style("font-size", `${fontSize}px`)
        .style("left", `${x + 2 * strokeWidth}px`)
        .style("top", `${y + strokeWidth}px`)
        .style("width", `${width - 3 * strokeWidth}px`)
        .style("height", `${height - 2 * strokeWidth}px`)
        .style("border", "none")
        .style("padding", "0")
        .style("outline", "none")
        .property("value", content)
        .on("keydown", function (event) {
            if (event.key === "Enter" || event.keyCode === 13) {
                console.log("Enter pressed! Value: ", this.value);
                if (action_func !== undefined) {
                    action_func(this.value)
                }
            }
        });

    input.node().focus();

    var svgText = d3select('.to-compute-text-length')

    input.on('input', function () {
        svgText.text(this.value);
        let textWidth = svgText.node().getComputedTextLength();

        if (textWidth > 195) {
            console.log('limit')
            // textWidth = max(textWidth, 200)
            var extraAntiStutter = 5 // random value to make sure the most inner input text is always more than the text length to avoid hidden
            var internal = textWidth + extraAntiStutter
            var external = internal + 2 * strokeWidth

            height = 2 * height
            d3select(".svg-container-corner-rect input").style("width", `${internal}px`).attr("height", height);
            d3select("#corneredRectId").attr("width", external + strokeWidth).attr("height", height);


            const strokeDashArray = calculateStrokeDashArray(external, height);
            d3select("#corneredRectId rect")
                .attr("stroke-dasharray", strokeDashArray)
                .attr("width", external)
                .attr("height", height);
        }
    });
}


function removeContainerCornerRect() {
    console.log('d3select(".svg-container-corner-rect")', d3select(".svg-container-corner-rect"))
    d3select(".svg-container-corner-rect")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();
}

function deepEngineSpinner(store) {
    let strokeWidth = 2
    let width = 150
    let height = 30
    getCorneredRectangle(window.innerWidth * 50 / 100 - 75, window.innerHeight * 70 / 100, width, height, strokeWidth)

    d3select("#corneredRectId")
        .append("rect")
        .attr("x", strokeWidth + 1)
        .attr("y", strokeWidth + 1)
        .style("position", "fixed")
        .attr("width", `0px`)
        .attr("height", `${height - 2 * strokeWidth}px`)
        .attr("fill", "#222222")
        .transition()
        .duration(2000)
        .attr("width", `${width - strokeWidth - 2}px`)
}



export {
    stroke,
    strokeWidth,
    strokeOpacity,
    adjust_tree_x,
    displayStaticTree,
    getCorneredRectangle,
    deepEngineSpinner,
    getFloatingTextBox,
    removeContainerCornerRect,
    d3selection,
    compute_tree,
    compute_base_tree,
    update_node_property,
    empty_static_tree,
    empty_force_tree,
    set_store,
    remove_map_menu
}
