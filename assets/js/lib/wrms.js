import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export var makecrv = function (getPoint) {
    let crv = new THREE.Curve();
    crv.getPoint = getPoint;

    return new THREE.TubeGeometry(crv, 100, 1, 3, true);
};

export var loadmodel = function (name, onload, texture) {
    var objload = new OBJLoader();
    var bmload = new THREE.TextureLoader();
    //bmload.setOptions( { imageOrientation: 'flipY' } );

    var mat, geo;

    const texturePath = texture || 'mod/' + name + '.bmp';

    bmload.load(
        // resource URL
        texturePath,
        tex => {
            mat = new THREE.MeshBasicMaterial({ map: tex });

            objload.load(
                './mod/' + name + '.obj',
                object => {
                    object.traverse(child => {
                        if (child.geometry !== undefined) {
                            geo = child.geometry;
                        }
                    });

                    if (onload) onload(geo, mat);
                },
                undefined,
                function (error) {
                    console.log(error);
                },
            );
        },
        undefined,
        function (err) {
            console.log(err);
        },
    );
};

export var formatters = {};

formatters['teapot3'] = mesh => {
    mesh.position.y = -50 * 0.25;
    mesh.scale.set(0.25, 0.25, 0.25);
    // mesh.rotateX(-Math.PI / 2);
    // mesh.rotateY(-Math.PI / 2);
    // mesh.rotateZ(Math.PI / 2);
    mesh.rotateX(Math.PI / 8);

    return mesh;
};

formatters['boquet'] = mesh => {
    mesh.position.z = -270;
    mesh.position.y = 50;
    mesh.scale.set(0.5, 0.5, 0.5);
    mesh.rotateX(Math.PI / 8);

    return mesh;
};

formatters['tea'] = mesh => {
    mesh.position.z = -270;
    mesh.position.y = 75;
    mesh.position.x = 10;
    mesh.scale.set(0.5, 0.5, 0.5);
    mesh.rotateX((Math.PI / 8) * 1.4);
    mesh.rotateZ(-Math.PI * 0.037);

    return mesh;
};

formatters['flower'] = mesh => {
    mesh.position.z = -600;
    mesh.position.y = -140;
    // mesh.position.x = -300;

    let g = new THREE.Group();
    g.add(mesh);

    g.rotateY(((Math.PI * 1) / 2) * 0.9);
    g.rotateX(((Math.PI * 1) / 4) * 0.8);
    g.rotateZ(-Math.PI * 0.005);

    g.scale.set(0.5, 0.5, 0.5);

    return g;
};

formatters['fruits'] = mesh => {
    mesh.position.z = -590;
    mesh.position.y = -120;
    mesh.position.x = 30;

    let g = new THREE.Group();
    g.add(mesh);

    g.rotateY(Math.PI / 8);
    g.rotateX(((Math.PI * 1) / 4) * 0.75);
    g.rotateZ(-Math.PI * 0.04);

    g.scale.set(0.5, 0.5, 0.5);

    return g;
};

export var makemodel = (name, onload) => {
    loadmodel(name, (geo, mat) => {
        var mesh = new THREE.Mesh(geo, mat);

        if (formatters[name]) {
            mesh = formatters[name](mesh);
        }

        if (onload) onload(mesh);
    });
};

export var sky = function (renderer, tex) {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    var hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(tex);
    tex.dispose();
    pmremGenerator.dispose();

    return hdrCubeRenderTarget.texture;
};

export var Wrm = function (
    name,
    crv,
    nsegs,
    rotation = t => ({ x: -Math.PI / 2 }),
    texture,
    onload = () => {},
) {
    var segments = [];
    var groups = [];
    this.group = new THREE.Group();

    loadmodel(
        name,
        (geo, mat) => {
            for (let i = 0; i < nsegs; i++) {
                var mesh = new THREE.Mesh(geo, mat);
                if (formatters[name]) {
                    mesh = formatters[name](mesh);
                }

                var container = new THREE.Group();
                container.add(mesh);
                groups[i] = container;
                // container.rotation.x = ;

                // for (const ax in rotation) container.rotation[ax] = rotation[ax];

                segments[i] = new THREE.Group();
                segments[i].add(container);

                this.group.add(segments[i]);
            }
            onload(this);
        },
        texture,
    );

    this.update = function (T) {
        var direction = new THREE.Vector3();
        var binormal = new THREE.Vector3();
        var normal = new THREE.Vector3();
        var position = new THREE.Vector3();
        var lookAt = new THREE.Vector3();

        for (let i in segments) {
            let seg = segments[i];
            let t = (T + i / nsegs) % 1;

            const rot = rotation(t);
            for (const ax in rot) groups[i].rotation[ax] = rot[ax];

            crv.parameters.path.getPointAt(t, position);
            position.multiplyScalar(1);

            // interpolation

            var tangents = crv.tangents.length;
            var pickt = t * tangents;
            var pick = Math.floor(pickt);
            var pickNext = (pick + 1) % tangents;

            binormal.subVectors(crv.binormals[pickNext], crv.binormals[pick]);
            binormal.multiplyScalar(pickt - pick).add(crv.binormals[pick]);

            crv.parameters.path.getTangentAt(t, direction);
            var offset = 15;

            normal.copy(binormal).cross(direction);

            // we move on a offset on its binormal

            position.add(normal.clone().multiplyScalar(offset));

            seg.position.copy(position);

            // using arclength for stablization in look ahead

            crv.parameters.path.getPointAt(
                (t + 30 / crv.parameters.path.getLength()) % 1,
                lookAt,
            );
            lookAt.multiplyScalar(1);

            // camera orientation 2 - up orientation via normal

            if (!true) lookAt.copy(position).add(direction);
            seg.matrix.lookAt(seg.position, lookAt, normal);
            seg.quaternion.setFromRotationMatrix(seg.matrix);
        }
    };
};
