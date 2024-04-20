import * as THREE from 'three';

import { loop, renderer } from 'js/lib/setup.js';
import { Wrm, makecrv } from 'js/lib/wrms.js';

document.querySelector('main').appendChild(renderer.domElement);

loop(90, (scene, camera) => {
    camera.far = 900;
    camera.updateProjectionMatrix();

    var wrm = new Wrm(
        //'flower',
        //    'fel-pro',
        //'lychee',
        'boquet',
        makecrv(function (t, optionalTarget) {
            var point = optionalTarget || new THREE.Vector3();

            t = 2 * Math.PI * t;

            var x =
                -0.22 * Math.cos(t) -
                1.28 * Math.sin(t) -
                0.44 * Math.cos(3 * t) -
                0.78 * Math.sin(3 * t);
            var y =
                -0.1 * Math.cos(2 * t) -
                0.27 * Math.sin(2 * t) +
                0.38 * Math.cos(4 * t) +
                0.46 * Math.sin(4 * t);
            var z = 0.7 * Math.cos(3 * t) - 0.4 * Math.sin(3 * t);

            return point.set(x, y, z).multiplyScalar(200);
        }),
        130,
    );
    scene.add(wrm.group);

    return tt => {
        const t = tt * 2;

        wrm.group.rotation.y = Math.PI * 2 * t;
        wrm.group.rotation.x = Math.PI * 2 * t;

        camera.position.setFromSpherical(
            new THREE.Spherical(
                600,
                //Math.PI * 2 * t,
                //t,
                //Math.PI / 2,
                Math.PI / 2 + Math.sin(Math.PI * 2 * tt),
                Math.PI * 2 * t,
            ),
        );
        camera.lookAt(0, 0, 0);

        wrm.update(t * 2);
    };
});
