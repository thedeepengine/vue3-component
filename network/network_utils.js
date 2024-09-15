import { drag as d3drag } from 'd3-drag'
import { forceSimulation as d3forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { select as d3select, selectAll as d3selectAll, selection as d3selection } from 'd3-selection'
import { linkHorizontal, line as d3line } from 'd3-shape'
import { transition } from 'd3-transition'
import { toRaw } from 'vue';
import { scrollToTitle, highlightNodeSwitcher, openMapByClickEvent, augmentedId, logVariables } from '@/utils.js'
import { splitOddEven, translate } from '@/utils.js';
import { hierarchy, tree } from 'd3-hierarchy'

const stroke = "#555";
const strokeWidth = 1.5;
const strokeOpacity = 1;

let timeoutId;


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


var adjust_tree_x_graph = function (root_left, root_right, side) {
    if (Object.keys(root_left).length === 0) return; // quit if root_left is empty as no adjustment is needed

    var diff = Math.abs(root_right.x - root_left.x)

    if (side === 'left') {
        root_left.descendants().map(item => { item.x += diff })
    } else {
        root_right.descendants().map(item => { item.x += diff })
    }
}


var adjust_tree_y_graph = function (root_left, root_right, side) {
    if (Object.keys(root_left).length === 0) return; // quit if root_left is empty as no adjustment is needed

    if (side === 'left') {
        var diff = root_right.y_start - root_left.y_end
        root_left.descendants().map(item => { item.y_start += diff; item.y_end += diff })
    } else {
        var diff = root_right.y_end - root_left.y_start
        root_right.descendants().map(item => { item.y_start -= diff; item.y_end -= diff })
    }
}

function displayStaticTree(store) {
    var linkContainer = d3select(".link_container")
    var underlinedPath = d3select(".underlined_path_container")
    var frontText = d3select(".front_text_container").selectAll(".node_text")

    linkContainer
        .setAttrs({fill:"none",stroke:stroke, "stroke-opacity":strokeOpacity,"stroke-linecap":null,"stroke-linejoin": null,"stroke-width": strokeWidth})
        .selectAll(".link")
        .data(store.root_links)
        .join("path")
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
        .attr("class", "link")
        .style('opacity', 1);

        const d3linew = d3line()
    .x(d => d[0])
    .y(d => d[1]);

        underlinedPath
            .attr("stroke", stroke)
            .attr("stroke-opacity", strokeOpacity)
            .attr("stroke-width", strokeWidth)
        .selectAll(".link")
            .data(store.root_nodes.map(x => ([[x.y_end, x.x], [x.y_start, x.x]])))  // Updated data binding
            .join(
                enter => enter.append("path")
                .attr("class", "link")
                .attr("d", d3linew),
            update => update
                .transition()
                .duration(300)
                .attr("d", d3linew),
            exit => exit
                .transition()
                .duration(300)
                .remove()
            );

    get_front_displayed_text(store,frontText)

    // addStaticTreeEvents(frontTextSelection, thisRef)
}

function addStaticTreeEvents(selection, thisRef) {

    var longClickDuration = 500; // Duration in milliseconds for a long click
    var timer;
    var longClickOccurred = false;

    selection
    .on('click', function (event) {
        let notRootNode = event.srcElement.__data__.depth != 0
            if (!longClickOccurred && notRootNode) {
                openMapByClickEvent(event, thisRef.store)
            } else if (!notRootNode) {
                thisRef.store.displayOntologySunburst = true
                thisRef.store.updateMarkdown(thisRef.store.ontologyRawMarkdown, false)
            }

            event.stopPropagation()
        })
        .on("mousemove", function (event) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(function () {
                highlightNodeSwitcher(false)
                let uuid = event.target.getAttribute('data-pathid')
                highlightNodeSwitcher(true, uuid)
                scrollToTitleFromNetwork(thisRef, event)
                thisRef.$log.debug(logVariables("NETWORK_UTILS-addStaticTreeEvents", { uuid, event }));
            }, 400);
        })
        .on("mouseout", function (event, d) {
            shrinkGraph(thisRef)
            thisRef.store.switchHoover = ''
            thisRef.store.graphPlaceholder = []
            highlightNodeSwitcher(false)
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }).on("mousedown", function(e) { // double tap works weirdly 

        }).on("mouseup", function() {
            clearTimeout(timer);
            longClickOccurred = false
        }).on("mouseleave", function() {
            clearTimeout(timer);
            longClickOccurred = false
        });
}


function updateNestedObjectByKey(obj, uuid, key, value) {
    if (obj.uuid === uuid) {
        obj[key] = value; 
        return true; 
    }

    if (Array.isArray(obj.children)) {
        for (let child of obj.children) {
            if (updateNestedObjectByKey(child, uuid, key, value)) {
                return true; 
            }
        }
    }
    return false;  
}

function get_front_displayed_text(store,d3sel) {
    let rr = d3sel
    .data(store.root_nodes, d => d.data.uuid); // Using a key function based on uuid

        const enteredElements = rr.enter()
        .append('foreignObject')
        .each(function(d) {
            d3select(this)
                .attr('class', 'node_text')
                .attr("transform", d => `translate(${d.y_start},${d.x-14})`)
                .style('width', d=>{ return `${d.y_end-d.y_start}px`}) 
                .attr('height', 13)
                .attr('data-pathid', d => d.data.uuid)
            .append('xhtml:body')
                .style('margin', 0)
                .style('padding', 0)  
                .style('font-size', '12px')
                .style('line-height', '1') 
                .style('background-color', 'transparent')
                .style('width', d=>{ return `${d.y_end-d.y_start}px`}) 
                .style('background', 'transparent')
                .style('font-family', 'inherit')
                .on('click', function(event) {
                    console.log('click', event)
                    event.preventDefault();  // Prevents the default click event which focuses the input
                    // this.blur();
                    event.stopPropagation()
                })
            .append('input')
                .attr('value', d => {return d.data.name})
                .attr('style', d=> {return `border: none; outline: none; font-size: 12px; padding: 0; font-family: inherit; box-sizing: border-box;`})
                .attr('type', 'text')
                .style('width', d=>{ return `${d.y_end-d.y_start}px`}) 
                .attr('background-color', 'transparent')
                .attr('background', 'transparent')
                .style('font-family', 'inherit')
                // .attr('disabled', true) 
                .on('keydown', function(event) {
                    if (event.key === 'Enter') {
                        updateNestedObjectByKey(store.pythonHierarchy, this.__data__.data.uuid, 'name', this.value)
                        compute_and_draw_tree(store)
                        displayStaticTree(store)
                    }
                })
                .on('click', function(event) {
                    console.log('click', event)
                    event.preventDefault();  // Prevents the default click event which focuses the input
                    // this.blur();
                    event.stopPropagation()
                })
                .on('dblclick', function() {
                    console.log('fffffds dbl click')
                    this.disabled = false;  // Enable the input on double-click
                    this.focus();  // Manually sets focus on the element when double-clicked
                })
                // .on('blur', function() {
                //     this.disabled = true;  // Disable the input when it loses focus
                // });
        })
        // .each(function(d) { console.log('Entering:', d); });  


        rr
            .attr("transform", d => `translate(${d.y_start},${d.x-14})`)
            .style('width', d=>`${d.y_end-d.y_start}px`)
            .attr('data-pathid', d => d.data.uuid)
            .select('input') // Select the input child of each existing .node_text div
                .property('value', d => d.data.name) // Use property for input value
                .style('width', d=> `${d.y_end-d.y_start}px`)
            .each(function(d) { console.log('updating:', d); });  

    rr.exit()
    // .each(function(d) { console.log('Exiting:', d); })
    .remove()
}

function compute_tree(store) {
    let d = store.pythonHierarchy
    let data_right = {}
    let data_left = {}
    if (d.children === undefined) {
        data_right = { 'name': d.name, 'position': d.position }
        data_left = {}
    } else if (d.children.length === 1) {
        data_right = { 'name': d.name, 'children': d.children, 'position': d.position }
        data_left = {}
    } else {
        var [odds, evens] = splitOddEven(d.children.length)
        let split_right = odds.map(x => d.children[x])
        let split_left = evens.map(x => d.children[x])
        data_right = { 'name': d.name, 'children': split_right, 'position': d.position }
        data_left = { 'name': '', 'children': split_left, 'position': d.position }
    }

    let root_right = compute_side(data_right, "right")
    let root_left = compute_side(data_left, "left")
    return {root_right, root_left}
}

function compute_side(data, side) {
    if (Object.keys(data).length === 0) return hierarchy({});

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

    root.leaves().map((item, i) => { item.x = -1000 + i * 15 }) // initialize leaves positions
    position_iter(root.leaves()) // recursivity
    return root
}

function draw_tree(store,root_right,root_left) {
    root_right=draw_side_tree(store,root_right, "right")
    root_left=draw_side_tree(store,root_left, "left")
    adjust_tree_x(root_left, root_right)
    return {root_right, root_left}
}

function compute_and_draw_tree(store) {
    let {root_right, root_left}= compute_tree(store)
    draw_tree(store,root_right, root_left)
    const root_nodes =[...root_right.descendants(), ...root_left.descendants()]
    const root_links = [...root_right.links(), ...root_left.links()]
    store.root_nodes=root_nodes
    store.root_links=root_links
    return {root_nodes,root_links}
}

function draw_side_tree(store,root,side) {
    if (Object.keys(root.data).length === 0) return hierarchy({});

    var SIDE_CONST = side === "right" ? 1 : -1
    var NODE_CLASS = "node_" + side
    const NODE_Y_SHIFT = 50
    const labels = root.descendants().map(d => d.data.name);

    // var side_container = d3select(".global_tree_container")
    //     .append("g").attr("class", side + "_tree_container")

    // let side_container = d3select(".global_tree_container ."+side+"_tree_container");
    let side_container = d3select(".global_tree_container ." + side + "_tree_container .node_container");

    var node_container = side_container
        .selectAll("." + NODE_CLASS)
        .data(root.descendants())
        .join("a")
        .attr('class', NODE_CLASS)

    // Add text to node_container
    var node_text = node_container
        .append("text")
        // .attr("dy", "-0.2em")
        // .attr('class', 'node_text')
        .style('line-height', '1') 
        .style('font-size', '12px')
        .style('font-family', 'inherit')
        .style("opacity", 0)
        .style('margin', 0)
        .style('padding', 0)  
        .attr('height', 3)
        .text((d, i) => labels[i])

    // compute text length.
    var text_length = node_text.nodes().reduce((prev, cur) => ({ ...prev, [cur.__data__.data.name]: cur.getComputedTextLength() || 0 }), {})
    node_container.selectAll("text").remove();

    // set position y_start and y_end of each node.
    var rec_y_position = function (node) {
        if (node.depth === 0) { // initialisation for root node
            root.y_start = root.y
            root.y_end = root.y + text_length[root.data.name]
        }

        if (node.children !== undefined) {
            for (const child of node.children) {
                child.y_start = (side === "right" ? child.parent.y_end:child.parent.y_start) + SIDE_CONST * NODE_Y_SHIFT + (side === "right" ? 0: -text_length[child.data.name])
                child.y_end = (side === "right" ? child.parent.y_end:child.parent.y_start) + SIDE_CONST * (NODE_Y_SHIFT + (side === "right" ? text_length[child.data.name] : 0))
                rec_y_position(child)
            }
        }
    }

    rec_y_position(root)
    root.descendants().map(item => item.side = side)

    if (side === 'right') {
        store.mapCenter = { ...store.mapCenter, text_length: text_length[labels[0]] }
        store.ontologyLeftPosition = 0 + (text_length[labels[0]] / 2);
        d3select('.ontologyNameBackground')
            .attr("x", store.ontologyLeftPosition).text(store.ontologyNameSelected);
    }
    return root
}

function scrollToTitleFromNetwork(thisRef, event) {
    const bbox = event.target.getBoundingClientRect();
    const middleX = bbox.x + bbox.width / 2;
    const mouseX = event.clientX
    let eventSide = event.target.__data__.side
    let switchHoover = thisRef.store.switchHoover

    if ((eventSide === 'right') && (mouseX >= middleX) && (switchHoover === 'left' || switchHoover === '')) {
        switchHoover = 'right'
    } else if ((eventSide === 'left') && (mouseX <= middleX) && (switchHoover === 'right' || switchHoover === '')) {
        switchHoover = 'left'
    }
    // scrollToTitle(thisRef, event)
}


function shrinkGraph(thisRef) {
    let graphElements = thisRef.store.graphPlaceholder
    if (Object.keys(graphElements).length !== 0) {

        graphElements.toHideText.style('opacity', 1)
        graphElements.toHideLinks.style('opacity', 1)
        graphElements.toHideUnderlined.style('opacity', 1)

        d3selectAll('.node_text_graph').remove()
        d3selectAll('.link_graph').remove()
    }
}




function staticTreeOpacity(opacity) {
    d3select(".global_tree_container")
    .transition()
    .duration(100)
    .style("opacity", opacity);
}



function calculateStrokeDashArray(width, height) {
    let widthGapRatio = 70/100
    const widthGap =width * widthGapRatio;
    const widthFull = (width * (1-widthGapRatio))/2;
    let verticalGapRatio = 60/100
    const verticalGap = height * verticalGapRatio
    const verticalFull = (height * (1-verticalGapRatio))/2;

    return `${widthFull},${widthGap},${widthFull+verticalFull},${verticalGap},${verticalFull+widthFull},${widthGap},${widthFull+verticalFull},${verticalGap},${verticalFull}`;
}

function getCorneredRectangle(x, y, width=200, height=50, strokeWidth = 2) {

    const strokeDashArray = calculateStrokeDashArray(width, height);

    var svgContainer = d3select("body").append("div")
    .attr("class", "svg-container-corner-rect")
    .style("left", x + "px")
    .style("top", y + "px")
    .style("position", "fixed")
    .style("opacity", 0)
    .style("z-index", 999999999)

    var svg = svgContainer.append("svg")
                .attr('id', 'corneredRectId')
                .attr("width", width+strokeWidth)
                .attr("height", height+strokeWidth)
                

    svg.append("rect")
        .attr("x", 1)
        .attr("y", 1)
        .style("position", "fixed")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", strokeWidth)
        .attr("stroke-dasharray", strokeDashArray);
    
    svg.append('text')
    .attr("class", "to-compute-text-length")
    .style("opacity", 0)
    .style("font-size", `12px`)
    
    svgContainer.transition()
        .duration(300)
        .style("opacity", 1);

}

function getFloatingTextBox(store, x, y, width = 200) {
    let strokeWidth = 2
    let fontSize = 12
    let height = fontSize + fontSize

    getCorneredRectangle(x, y, width, height, strokeWidth)

    var input = d3select(".svg-container-corner-rect")
        .append("input")
        .attr("type", "text")
        .style("position", "fixed")
        .style("font-size", `${fontSize}px`)
        .style("left", `${x+2*strokeWidth}px`)
        .style("top", `${y+strokeWidth}px`)
        .style("width", `${width-3*strokeWidth}px`)
        .style("height", `${height-2*strokeWidth}px`)
        .style("border", "none")
        .style("padding", "0")
        .style("outline", "none")
        .on("keydown", function(event) {
            if (event.key === "Enter" || event.keyCode === 13) {
                console.log("Enter pressed! Value: ", this.value);
                store.floatingBoxQuery(this.value)
            }
        });
        
    
    input.node().focus();

    var svgText = d3select('.to-compute-text-length')

    input.on('input', function() {
            svgText.text(this.value);
            let textWidth = svgText.node().getComputedTextLength();
            if (textWidth > 195) {
                // textWidth = max(textWidth, 200)
                var extraAntiStutter = 5 // random value to make sure the most inner input text is always more than the text length to avoid hidden
                var internal = textWidth+extraAntiStutter
                var external = internal+2*strokeWidth
                const strokeDashArray = calculateStrokeDashArray(external, height);

                d3select(".svg-container-corner-rect input").style("width", `${internal}px`)

                d3select("#corneredRectId").attr("width", external+strokeWidth);
                d3select("#corneredRectId rect").attr("width", external);
                d3select("#corneredRectId rect").attr("stroke-dasharray", strokeDashArray);
        }
    });

    store.textBoxDisplayed = true
}


function removeContainerCornerRect(store) {
    d3select(".svg-container-corner-rect")
    .transition()
    .duration(500)
    .style("opacity", 0)
    .remove();
    store.textBoxDisplayed = false
}

function deepEngineSpinner(store) {
    let strokeWidth = 2
    let width = 150
    let height = 30
    getCorneredRectangle(window.innerWidth*50/100-75, window.innerHeight*70/100, width, height, strokeWidth)

    d3select("#corneredRectId")
        .append("rect")
        .attr("x", strokeWidth + 1)
        .attr("y", strokeWidth + 1)
        .style("position", "fixed")
        .attr("width", `0px`)
        .attr("height", `${height - 2*strokeWidth}px`)
        .attr("fill", "#222222")
        .transition()
        .duration(2000)
        .attr("width", `${width - strokeWidth - 2}px`)

}

function expand_it(withAnimation=true) {

    // const current_map = computed(() => {
    //     return store.root_nodes.value.map(node => ({ ...node, x: store.selectedItem.x, y: store.selectedItem.y, r: 10, name: node.data.name, computed_x: node.y_start, computed_y: node.x }))
    // })

    if (withAnimation) {
        d3select(".global_tree_container")
            .selectAll(".new")
            .data(this.current_map, function (d) { return d ? d.name : this.id; })
            .enter().append('circle').attr('class', 'new')

        var expandSimulation = d3forceSimulation()
            .force("x", forceX().x(d => d.computed_x))
            .force("y", forceY().y(d => d.computed_y))
            .nodes(this.current_map)
            .alphaMin(0.3)
            .on("tick", ticked)
            .on("end", ended)

        var ref = this

        d3selectAll('.back_node_container,.back_link_container').attr('opacity', 0.1)

        var newCircle = d3select(".global_tree_container").selectAll("circle.new")

        function ticked() {
            newCircle
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .style('opacity', 1 - 0.5 * (1 - expandSimulation.alpha()))
                .attr('r', 10 - 14 * (1 - expandSimulation.alpha()));
        }

        function ended() {
            displayStaticTree(this.store)
        }
    } else {
        var ref = this
        var newCircle = d3selectAll("circle.base_node")
        console.log('newCircle', newCircle)
        newCircle.style('opacity', 0.2)
        displayStaticTree(this.store)
    }

}

function shrink_it(initialPosition) {

    d3select(".global_tree_container")
        .selectAll("g.underlined_path_container path,g.link_container path,g.front_text_container > text")
        .remove()

    //.right_tree_container,.left_tree_container
    var toShrink = d3select(".global_tree_container").selectAll("circle.new")

    var shrinkSimulation = d3forceSimulation()
        .force("x", forceX().x(d => initialPosition.x - this.graphX))
        .force("y", forceY().y(d => initialPosition.y - this.graphY))
        .nodes(toShrink.data())
        .alphaMin(0.1)
        .on("tick", ticked)
        .on("end", ended)


    // var back_text = d3select(".back_text_container")
    var forcedNode = d3selectAll("circle.base_node")
    var ref = this


    d3selectAll("circle.base_node,.forcedlink")
        .style('opacity', 1)

    function ticked() {
        toShrink
            .attr("r", () => 10 - 10 * (1 - shrinkSimulation.alpha()))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)

        forcedNode
            // .style('opacity', 0.5 + 0.5 * (1 - shrinkSimulation.alpha()))
            .attr('r', ref.forcedNodeR / 2 + ref.forcedNodeR / 2 * (1 - shrinkSimulation.alpha()));
        // back_text.style('opacity', (1 - shrinkSimulation.alpha()))
    }

    function ended() {
        toShrink.remove()
        ref.store.deepLevel = ref.store.deepLevel - 1
        ref.store.activeComponent = 'DataShokuninIntro'
    }

    var clickedItemLink = d3selectAll('.forcedlink').filter(x => x.target.data.name === this.store.selectedItem.data.name)
    var clickedItemNode = d3selectAll("circle.base_node").filter(x => x.data.name === this.store.selectedItem.data.name)

    clickedItemLink.attr('opacity', 1)
    clickedItemNode.attr('opacity', 1)

}


export {
    stroke,
    strokeWidth,
    strokeOpacity,
    adjust_tree_x,
    adjust_tree_y_graph,
    displayStaticTree,
    staticTreeOpacity,
    getCorneredRectangle,
    deepEngineSpinner,
    getFloatingTextBox,
    removeContainerCornerRect,
    d3selection,
    compute_tree,
    compute_and_draw_tree,
    updateNestedObjectByKey,
    expand_it,
    shrink_it
}
