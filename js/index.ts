import * as three from 'three';

import("../pkg/index").then(module => {
    console.log(module.sum(new Int32Array([1, 1, 1])));
    var app = new App();
});

class App {

    camera: three.PerspectiveCamera;
    scene: three.Scene;
    renderer: three.WebGLRenderer;

    mesh: three.Mesh | undefined;
    frameNum: number;
    frameCount: number;
    frameSize: number;

    constructor() {
        this.camera = new three.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.z = 500;
        
        this.scene = new three.Scene();
        this.scene.background = new three.Color("gray");

        const meshPromise = new Promise((resolve, reject) => {
            new three.TextureLoader().load('compass.png', (texture) => {
                const geometry = new three.PlaneGeometry(600, 600);
                const material = new three.MeshBasicMaterial( { map: texture } );

                this.frameSize = 16/512;
                this.frameCount = 512/16;
                this.frameNum = 0;
                texture.repeat.set(1, this.frameSize);
                texture.magFilter = three.NearestFilter;
                material.alphaTest = 0.5;

                this.mesh = new three.Mesh(geometry, material);
                resolve(this.mesh);
            });
        });
        
        this.renderer = new three.WebGLRenderer();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.resize();
        document.body.appendChild( this.renderer.domElement );

        meshPromise.then((mesh) => {
            this.scene.add(this.mesh);
        });

        //start animating
        this.animate = this.animate.bind(this);
        this.resize = this.resize.bind(this);
        window.addEventListener("resize", this.resize);
        window.requestAnimationFrame(this.animate);
    }

    animate() {
        window.requestAnimationFrame(this.animate);

        this.frameNum += 1;
        this.frameNum = this.frameNum % this.frameCount;
        (this.mesh?.material as three.MeshBasicMaterial)?.map.offset.set(0, 1 - (this.frameSize * (this.frameNum + 1)));

        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        const pixelRatio = window.devicePixelRatio;
        const width = window.innerWidth * pixelRatio;
        const height = window.innerHeight * pixelRatio;
        const aspect = width / height;
        
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }
}