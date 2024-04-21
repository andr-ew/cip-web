import * as THREE from 'three';

import { loop, renderer } from 'js/lib/setup.js';
import { Wrm, makecrv } from 'js/lib/wrms.js';

document.querySelector('main').appendChild(renderer.domElement);

loop(130, (scene, camera) => {
    camera.far = 900;
    camera.updateProjectionMatrix();

    var wrm = new Wrm(
        'flower',
        //'lychee',
        // 'boquet',
        makecrv(function (t, optionalTarget) {
            var point = optionalTarget || new THREE.Vector3();

            t *= Math.PI * 2;

            const x = (2 + Math.cos(3 * t)) * Math.cos(2 * t);
            const y = (2 + Math.cos(3 * t)) * Math.sin(2 * t);
            const z = Math.sin(3 * t) * 2;

            return point.set(x, y, z).multiplyScalar(100);
        }),
        110,

        // 'teapot3',
        // makecrv(function (t, optionalTarget) {
        //     var point = optionalTarget || new THREE.Vector3();

        //     t *= Math.PI * 2;

        //     const x = (2 + Math.cos(3 * t)) * Math.cos(2 * t);
        //     const y = (2 + Math.cos(3 * t)) * Math.sin(2 * t);
        //     const z = Math.sin(3 * t) * 2;

        //     return point.set(x, y, z).multiplyScalar(43);
        // }),
        // 123,
    );
    scene.add(wrm.group);

    const dice1 = Math.random();
    const dice2 = Math.random();

    return t => {
        wrm.group.rotation.y = Math.PI * 2 * (t + dice1);
        wrm.group.rotation.x = Math.PI * 2 * (t + dice2);

        camera.position.setFromSpherical(
            new THREE.Spherical(
                550,
                //250
                //Math.PI * 2 * t,
                //t,
                //Math.PI / 2,
                Math.PI / 2 + Math.sin(Math.PI * 2 * t),
                Math.PI * 2 * t,
            ),
        );
        camera.lookAt(0, 0, 0);

        wrm.update(t * 5);
    };
});
