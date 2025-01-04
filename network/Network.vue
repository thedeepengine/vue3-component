<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <div>
        <div class="network_class"></div>
        <div style="position: fixed;bottom:0;padding-bottom: 28px;">
            <div style="font-weight: bold;">{{ hovered_data?.title }}</div>
            <div style="font-weight: 200;">{{ hovered_data?.subs }}</div>
        </div>
    </div>
</template>

<script setup>

import { drag as d3drag } from 'd3-drag'
import { hierarchy } from 'd3-hierarchy'
import { forceSimulation as d3forceSimulation, forceX, forceY, forceCollide, forceLink, forceManyBody } from 'd3-force'
import { select as d3select, selectAll as d3selectAll } from 'd3-selection'
import { min, max } from "d3-array";
import { scaleLinear } from "d3-scale";
import { ref, onMounted, watch, onActivated, onDeactivated } from "vue";
import { defineProps } from 'vue';
import { dimStore } from '@/components_shared/dimStore.js'
import { displayStaticTree, empty_static_tree, empty_force_tree } from './network_utils.js';

const dim_store = dimStore()

const props = defineProps({
    is_mobile: false
});

const isElementPresent = ref(false);
let maxRetries = 10;
let retries = 0;


onMounted(() => {
    initSVGBase()
    window.addEventListener("mousemove", updateButtonOpacity);
})

const checkElement = () => {
    const element = document.querySelector('.network_class');
    if (element) {
        isElementPresent.value = true;
    } else if (retries < maxRetries) {
        retries++;
        setTimeout(checkElement, 100);
    }
};

watch(() => [dim_store.w_data, 
            dim_store.d3_network_data, 
            isElementPresent.value, 
            dim_store.dimension],
    ([refresh_network, s, old_data], [q, h, w]) => {
        if (isElementPresent.value) {
            if (dim_store.dimension === 'network' && !dim_store.is_object_dirty.d3_network_data) {
                empty_static_tree()
                forcedTree(dim_store.d3_network_data, 'network')
            } else if (dim_store.dimension === 'hierarchy' && !dim_store.is_object_dirty.w_data) {
                empty_force_tree()
                displayStaticTree(dim_store)
            }
        }
    });


onActivated(() => {
    maxRetries = 10;
    retries = 0;
    checkElement()
});

onDeactivated(() => {
    isElementPresent.value = false
    if (dim_store.refresh_network === 'hierarchy') {
        empty_static_tree()
    } else if (dim_store.refresh_network === 'network') {
        empty_force_tree()
    }
});

const forcedNodeR = 5
const buttonOpacity = ref(0.2)
const simulation = ref(null)
const graphX = ref(0)
const graphY = ref(0)
const dragStartX = ref(0)
const dragStartY = ref(0)
const isDragging = ref(false)
const longClickTimer = ref(null);
const longClickLength = ref(null)

const hovered_data = ref()

function dragStart(event) {
    isDragging.value = false
    longClickLength.value = new Date();
    dragStartX.value = event.x
    dragStartY.value = event.y
}

function dragging(event) {
    isDragging.value = true

    if (longClickTimer.value) {
        clearTimeout(longClickTimer);
        longClickTimer.value = null;
    }

    if (isDragging.value) {
        const deltaX = event.x - dragStartX.value
        const deltaY = event.y - dragStartY.value
        graphX.value += deltaX
        graphY.value += deltaY
        dragStartX.value = event.x
        dragStartY.value = event.y
        d3select(".global_tree_container").attr("transform", d => `translate(${graphX.value},${graphY.value})`)
    }
}

function dragEnd(event) {
    let endTime = new Date();
    if ((endTime - longClickLength.value) < 1000) {

        if (longClickTimer.value) { // cancel longclick timeout
            clearTimeout(longClickTimer.value);
            longClickTimer.value = null;
        }
    } else {
        isDragging.value = false
    }
}

function initSVGBase() {
    let width = window.innerWidth
    let height = window.innerHeight
    let viewBox = [-width / 2 / 2, -height / 2, width / 2, height / 2]
    if (props.is_mobile) {
        height = window.innerHeight / 2
        viewBox = [-width / 2, -height / 2, width, height]
    }

    console.log('window.innerWidth', window.innerWidth)
    d3select(".network_class")
    .style('height', '100vh')
        .append("svg")
        .attr('id', 'forcedtree')
        .attr("viewBox", viewBox)
        .style("width", "100%")
        .style("height", "100%")
        .attr("style", "overflow: visible")
        .attr("font-family", "sans-serif")
        .attr("font-size", 11)

    d3select(".network_class svg").append("g")
        .attr("class", "global_tree_container unselectable-text")

    let g_tree = d3select(".global_tree_container")
    g_tree.append("g").attr("class", "link_container").attr("stroke", 'black')
    g_tree.append("g").attr("class", "underlined_path_container").attr("stroke", 'black')
    g_tree.append("g").attr("class", "front_text_container")

    g_tree.append("g").attr("class", "left_tree_container").append("g").attr("class", "node_container")
    g_tree.append("g").attr("class", "right_tree_container").append("g").attr("class", "node_container")

    d3select(".network_class")
        .call(d3drag()
            .on('start.namespace', dragStart)
            .on('drag.namespace', dragging)
            .on('end.namespace', dragEnd))
}

function addOntologyBackgroundTitle() {
    d3select(".network_class svg")
        .append("text")
        .setAttrs({
            "class": "ontologyNameBackground",
            "y": -window.innerHeight / 2 + window.innerHeight / 2 * 40 / 100,
            "fill": '#BBBBBB',
            "font-size": '1vw',
            "text-anchor": "middle"
        })
}

function dim_force_network() {
    d3selectAll("circle.base_node").style('opacity', 0.2)
}

function find_object_by_front_UUID(objects, uuid_front) {
    if (!objects || objects.length === 0) {
        return null;
    }

    for (let obj of objects) {
        if (obj.uuid_front === uuid_front) {
            return obj;
        }

        if (obj.children && obj.children.length > 0) {
            const result = find_object_by_front_UUID(obj.children, uuid_front);
            if (result) {
                return result; // Return the found object
            }
        }
    }
    return null;
}


function groupByField(array, group, value) {
    return array.reduce((result, item) => {
        const key = item[group];
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item[value]);
        return result;
    }, {});
}


function forcedTree(data, data_type = 'hierarchy') {
    if (Object.keys(data).length > 0) {
        let links;
        let nodes;

        if (data_type === 'hierarchy') {
            const root = hierarchy(data);
            links = root.links();
            nodes = root.descendants();
        } else if (data_type === 'network') {
            links = data.links
            nodes = data.nodes
        }

        const nodeColor = '#3A434A'

        simulation.value = d3forceSimulation()
            .nodes(nodes)
            .force("x", forceX())
            .force("y", forceY())
            .force("charge", forceManyBody())
            .force("link", forceLink(links).id(d => d.id))
            .force("collide", forceCollide().strength(0.3).radius(d => forcedNodeR + 12));

        const svg = d3select("#forcedtree")

        const link = svg.append("g")
            .attr('class', 'back_link_container')
            .attr("stroke", "#4c5467")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr('class', 'forcedlink');

        const nodet = svg.append("g")
            .attr('class', 'back_node_container')
            .attr("fill", 'none')
            .attr("stroke", 'none')
            .attr("stroke-width", 0.3)
            .selectAll("circle")
            .data(nodes)
            .join("g")
            .attr('class', 'base_node')
            .call(drag())

        // visible circles
        nodet.append("circle")
            .attr('class', 'visible_circle')
            .attr("fill", '#4c5467')
            .attr("data-circle-uuid", d => { return d.uuid_front })
            .attr("stroke", 'none')
            .attr("r", d => Math.max(5, Math.sqrt(d.weight * 50)));


        // Invisible hover circle
        nodet.append("circle")
            .attr("r", d => Math.max(10, Math.sqrt(d.weight * 50) + 5))
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mouseover", function (event, d) {
                var front_uuid = d3select(this.parentNode).select(".visible_circle").attr("data-circle-uuid");
                let obj = find_object_by_front_UUID([dim_store.w_data], front_uuid)
                console.log('dim_store.header_prop_name', dim_store.header_prop_name)
                hovered_data.value = { title: obj[dim_store.header_prop_name] }

                if (obj?.children) {
                    hovered_data.value.subs = groupByField(obj.children, 'parent_ref', 'name')
                }
            })
            .on("mouseout", function (event, d) {
                d3select(this.parentNode).select(".visible_circle").attr("fill", "#4c5467");
            });


        const node = svg.selectAll("circle");

        var text = svg.append("g").attr("class", "back_text_container")
            .selectAll('.back_text')
            .data(nodes, function (d) { return d ? d.name : this.id; })
            .join('text')
            .setAttrs({
                'class': 'back_text', 'color': '#b0b0b0',
                'opacity': function (d) { return d.depth < 1 ? 0.7 : 0 }, 'font-size': 10, 'text-anchor': () => 'middle'
            })
            .text(d => { return d.name })
            .style('opacity', 0)
            .attr("display", "none");

        var localThis = simulation.value

        function drag() {

            function dragstarted(event, d) {
                if (!event.active) localThis.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) localThis.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        localThis.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            text
                .attr("x", d => d.x)
                .attr("y", d => d.y + 17);


        });
        return svg.node();
    }
}

let updateButtonOpacity = function (event) {
    const windowHeight = window.innerHeight;
    const mouseY = event.clientY;
    const distanceToBottom = windowHeight - mouseY - 100;
    buttonOpacity.value = Math.min(1, 1 - distanceToBottom / 100);
}

</script>

<style>
.backButton {
    position: absolute;
    bottom: 14px;
    margin: auto;
    margin-bottom: 14px;
    left: 50%;
    --n-border-radius: 0;
    background-color: white;
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}

foreignObject body input {
    background-color: transparent;
    --color-background: transparent;
    --vt-c-white: transparent;
}


.hover-trace-left {
    width: 10px; 
    height: 10px; 
    /* background: red;  */
    display: inline-block; 
    position: absolute; 
    bottom: 2px; 
    transform: translate(15px,0);
    right: 0;
    opacity:0;
    transition: opacity 0.3s;
    /* overflow: visible; */
}

.hover-trace-left:hover {
    opacity: 1;
}

.hover-trace-right {
    width: 10px; 
    height: 10px; 
    /* background: red;  */
    display: inline-block; 
    position: absolute; 
    bottom: 2px; 
    left: 0;
    transform: translate(-15px,0);
    opacity: 0;
    transition: opacity 0.3s;
}

.hover-trace-right:hover {
    opacity: 1;
}

.network_class {
    width: 50vw;
}
</style>