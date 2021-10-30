import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DoubleSide } from 'three'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Objects
 */
// Helicoid fn
function helicoid(u, v, target) {
    let alpha = Math.PI * 2 * (u - .5)
    let theta = Math.PI * 2 * (v - .5)

    const t = 5
    const bottom = 1 + Math.cosh(alpha) * Math.cosh(theta)

    let x = Math.sinh(alpha) * Math.cos(t * theta) / bottom
    let y = 1.5 * Math.cosh(alpha) * Math.sinh(theta) / bottom
    let z = Math.sinh(alpha) * Math.sin(t * theta) / bottom

    target.set(x, y, z)

}

const geo = new THREE.ParametricGeometry(helicoid, 200, 200)
function getMaterial() {
    const mat = new THREE.MeshPhysicalMaterial({
        color: 0x3f07c5,
        roughness: 1,
        metalness: .75,
        clearcoat: .5,
        clearcoatRoughness: 0.1,
        side: DoubleSide
    })

    return mat
}
const mesh = new THREE.Mesh(geo, getMaterial())
scene.add(mesh)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Lighting
 */
{
    scene.add(new THREE.AmbientLight(0xffffff, 1))
}

{
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.x = 1
    light.position.y = 0
    light.position.z = 1
    scene.add(light)
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0


const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    mesh.rotation.y = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()