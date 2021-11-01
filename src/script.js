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
camera.position.z = 4
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
    let y = 2 * Math.cosh(alpha) * Math.sinh(theta) / bottom
    let z = Math.sinh(alpha) * Math.sin(t * theta) / bottom

    target.set(x, y, z)

}

const geo = new THREE.ParametricGeometry(helicoid, 200, 200)
function getMaterial() {
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x3f07c5,
        roughness: 1,
        metalness: .75,
        clearcoat: .5,
        clearcoatRoughness: 0.1,
        side: DoubleSide
    })

    material.onBeforeCompile = function (shader) {
        shader.uniforms.playhead = { value: 0 }

        shader.fragmentShader = `uniform float playhead;\n` + shader.fragmentShader

        shader.fragmentShader = shader.fragmentShader.replace(
            "#include <logdepthbuf_fragment>",
            `
           float diff = dot(vec3(1),vNormal);

           vec3 a = vec3(0.5, 0.5, 0.5);
           vec3 b = vec3(0.5, 0.5, 0.5);
    	   vec3 c = vec3(1, 1000.0, 1.0);
           vec3 d = vec3(0.30, 0.20, 0.20);
           
           vec3 cc =  a + b * cos(2.*3.141592*(c*diff+d + playhead*3.));
           
           diffuseColor.rgb = vec3(diff, 0, 0);
           diffuseColor.rgb = cc;
            ` + `#include <logdepthbuf_fragment>`
        )
        material.userData.shader = shader
    }

    return material
}

const material = getMaterial()

const mesh = new THREE.Mesh(geo, material)
mesh.castShadow = mesh.receiveShadow = true
scene.add(mesh)


const numBalls = 10
const ballsArr = []
const ballGeo = new THREE.IcosahedronBufferGeometry(0.1, 5)
for(let i = 0; i <= numBalls; i++) {
    ballsArr.push(new THREE.Mesh(ballGeo, material))
}

ballsArr.forEach((ball) => {
    scene.add(ball)
})


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enable = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

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
    light.castShadow = true
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    light.shadow.camera.right = 2
    light.shadow.camera.left = -2
    light.shadow.camera.top = 2
    light.shadow.camera.bottom = -2
    light.shadow.bias = 0.000001
    scene.add(light)
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0


const tick = (playhead) => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    if(material.userData.shader) {
        material.userData.shader.uniforms.playhead.value = playhead/3000
    }

    mesh.rotation.y = playhead / 1000
    // ballsArr.forEach((ball, ndx) => {
    //     let theta = (playhead / 6000)*2*(Math.PI*`-0.${ndx}`)
    //     ball.position.x = 2.2 * Math.sin(theta)
    //     ball.position.y = 2.2 * Math.cos(theta)

    // })
    for (let i = 0; i < ballsArr.length; i++) {
        if(ballsArr[0]) {
            ballsArr[0].position.x = 2.2 * Math.sin((playhead / 6000)*2*(Math.PI*`-0.${0.1}`))
            ballsArr[0].position.y = 2.2 * Math.sin((playhead / 6000)*2*(Math.PI*`-0.${0.1}`))
        }
        
        let theta = (playhead / 6000)*2*(Math.PI*`-0.${i}`)
        ballsArr[i].position.x = 2.2 * Math.sin(theta)
        ballsArr[i].position.y = 2.2 * Math.cos(theta)
        // const ball = ballArr[i]
        
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()