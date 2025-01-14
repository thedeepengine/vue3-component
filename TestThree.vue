<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <div id="three-container"></div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, shallowRef } from 'vue'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

onMounted(() => {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    let elt = window.document.getElementById('three-container')
    elt.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Create points for the scatter plot
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    for (let i = 0; i < 100; i++) {
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = Math.random() * 20 - 10;
        sphere.position.y = Math.random() * 20 - 10;
        sphere.position.z = Math.random() * 20 - 10;
        scene.add(sphere);
    }

    // Set camera position
    camera.position.z = 30;

    // Add light
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
})
</script>