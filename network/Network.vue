<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <div class="network_class"></div>
</template>

<script setup>

import { drag as d3drag } from 'd3-drag'
import { hierarchy } from 'd3-hierarchy'
import { forceSimulation as d3forceSimulation, forceX, forceY, forceCollide } from 'd3-force'
import { select as d3select, selectAll as d3selectAll } from 'd3-selection'
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
        setTimeout(checkElement, 100); // Check again in 100ms
    }
};

watch(() => [dim_store.refresh_network, isElementPresent.value],
    ([refresh_network, old_data], [q, w]) => {
        if (isElementPresent.value === true) {
            if (refresh_network === 'network') {
                empty_static_tree()
                forcedTree(dim_store.w_data)
            } else if (refresh_network === 'hierarchy') {
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

    // d3select("#affix_container")
    //     .call(d3drag()
    //         .on('start.namespace', dragStart)
    //         .on('drag.namespace', dragging)
    //         .on('end.namespace', dragEnd))
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

function forcedTree(data) {
    const root = hierarchy(data);
    console.log('root', root)
    const links = root.links();
    const nodes = root.descendants();

    const nodeColor = '#3A434A'

    simulation.value = d3forceSimulation()
        .nodes(nodes)
        .force("x", forceX())
        .force("y", forceY())
        .force("collide", forceCollide().strength(0.3).radius(d => forcedNodeR + 12));

    const svg = d3select("#forcedtree")
        .attr("class", "onesvg2")

    var text = svg.append("g").attr("class", "back_text_container")
        .selectAll('.back_text')
        .data(nodes, function (d) { return d ? d.data.name : this.id; })
        .join('text')
        .setAttrs({ 'class': 'back_text', 'opacity': 0, 'font-size': 10, 'text-anchor': () => 'middle' })
        .text(d => { return d.data.name })

    const link = svg.append("g")
        .setAttrs({ 'class': 'back_link_container', 'stroke': '#999', 'stroke-opacity': 0.6, 'stroke-width': 0.5 })
        .selectAll("line")
        .data(links)
        .join("line")
        .attr('class', 'forcedlink');

    const node = svg.append("g")
        .setAttrs({ 'class': 'back_node_container', "fill": nodeColor, "stroke": nodeColor, "stroke-width": 0.3, "stroke": nodeColor })
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .setAttrs({
            "fill": d => { return d.data.name === 'Genesis' ? '#d4af37' : nodeColor },
            "stroke": d => { return d.data.name === 'Genesis' ? '#d4af37' : nodeColor },
            'class': 'base_node',
            "r": forcedNodeR
        })
        .call(drag());

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

    });
    return svg.node();
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
</style>