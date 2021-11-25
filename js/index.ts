import * as three from 'three';

class App {

    scene: three.Scene;
    camera: three.PerspectiveCamera;
    renderer: three.WebGLRenderer;

    renderTask: () => void;

    frameNum: number = 0;
    readonly frameSize: number = 16/512;

    constructor() {
        this.scene = new three.Scene();
        this.scene.background = new three.Color("gray");

        this.camera = new three.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.z = 500;

        this.renderer = new three.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.resize();
        document.body.appendChild(this.renderer.domElement);

        //start animating
        this.animate = this.animate.bind(this);
        this.resize = this.resize.bind(this);
        window.addEventListener("resize", this.resize);
        window.requestAnimationFrame(this.animate);

        const meshPromise = new Promise<three.Mesh>((resolve, reject) => {
            new three.TextureLoader().load('compass.png', (texture) => {
                const geometry = new three.PlaneGeometry(600, 600);
                const material = new three.MeshBasicMaterial( {map: texture } );

                var mesh = new three.Mesh(geometry, material);

                this.scene.add(mesh);
                resolve(mesh);

                texture.repeat.set(1, this.frameSize);

                texture.magFilter = three.NearestFilter;

                material.alphaTest = 0.5;
            })
        });

        meshPromise.then((mesh: three.Mesh) => {
            this.renderTask = () => {
                this.frameNum += 1;
                (mesh.material as three.MeshBasicMaterial)?.map.offset.set(0, 1 - this.frameSize * this.frameNum);
                const frameCount = 512/16;
                this.frameNum = this.frameNum % frameCount;
            };
        });
    }

    animate() {
        window.requestAnimationFrame(this.animate);

        this.renderTask?.();

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

var app = new App();