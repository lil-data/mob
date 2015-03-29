window.onload = function() {

	var isForward = false;

	// fps display
	var stats = new Stats();
	stats.setMode(2);
	document.body.appendChild(stats.domElement);
	document.getElementById("stats").style.position = "absolute";

	document.addEventListener("keydown", onKeyDown); // keyboard input handler
	document.addEventListener("keyup", onKeyUp); // keyboard input handler

	var renderer, scene, camera, controls, meshMaterial;

	renderer = new THREE.WebGLRenderer({antialias: true});
	document.body.appendChild( renderer.domElement );
	renderer.setSize(window.innerWidth, window.innerHeight);

	scene = new THREE.Scene();

	var x_axis = new THREE.Vector3(1, 0, 0);
	var z_axis = new THREE.Vector3(0, 0, 1);
	var rotate_x = 0.0;
	var rotate_z = 0.0;

	// sphere
	radius = 25;
	var sphere = new THREE.Mesh(
		new THREE.SphereGeometry(radius, 2, 2),
		new THREE.MeshBasicMaterial({
			wireframe: true,
			wireframeLinewidth: 5}));
	sphere.position.set(0, radius, 0);
	console.log(sphere.geometry.vertices.length);
	scene.add(sphere);

	var floor = new THREE.Geometry();
	var scale = 100.0;

	// for (i = 0; i < sphere.geometry.vertices)
	for (i = -2; i < 3; ++i) {
		for (j = -2; j < 3; ++j) {
			floor.vertices.push(new THREE.Vector3(scale*j, 0, scale*i));
		}
	}

	for (k = 0; k < 16; ++k) {
		i = k + Math.floor(k/4);
		floor.faces.push(new THREE.Face3(i, i+1, i+5));
	}

	scene.add(
		new THREE.Mesh(
			floor,
			new THREE.MeshBasicMaterial({wireframe: true})));

	// axes
	axes = buildAxes(1000);
	scene.add(axes);

	camera();
	controls();
	animate();

	function mobius(v, f) {
		for (var i = 0; i < v.length; i++) {
			// [x,y] = [(x/1-z),(y/1-z)]
			// v[i].x = v[i].x/1-v[i].z;
			// v[i].y = v[i].y/1-v[i].z;
			// v[i].z = 0;

			// [x,z] = [(x/1-y),(z/1-y)]
			v[i].x = v[i].x/1-v[i].y;
			v[i].z = v[i].z/1-v[i].y;
			v[i].y = 0;
		};

		for (var i = 0; i < f.length; i++) {
			// [x,y] = [(x/1-z),(y/1-z)]
			// f[i].x = f[i].x/1-f[i].z;
			// f[i].y = f[i].y/1-f[i].z;
			// f[i].z = 0;

			// [x,z] = [(x/1-y),(z/1-y)]
			f[i].x = f[i].x/1-f[i].y;
			f[i].z = f[i].z/1-f[i].y;
			f[i].y = 0;
		};
	}

	function camera() {
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set(-5, 100, -100);
		camera.lookAt( new THREE.Vector3(0, 0, 0) );
	}

	function controls() {
		controls = new THREE.TrackballControls( camera );
		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 0.2;
		controls.panSpeed = 0.8;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;
	}

	function onKeyUp(event) {
		switch (event.keyCode) {
			case 37: rotate_z = 0; break; // left
			case 38: rotate_x = 0; break; // up
			case 39: rotate_z = 0; break; // right
			case 40: rotate_x = 0; break; // down
		}
	}

	function onKeyDown(event) {
		switch (event.keyCode) {
			case 37: rotate_z = 1.0; break; // left
			case 38: rotate_x = 1.0; break; // up
			case 39: rotate_z = -1.0; break; // right
			case 40: rotate_x = -1.0; break; // down
		}
	}

	function animate() {
		stats.begin();
		controls.update();
		renderer.render(scene, camera);
		stats.end();

		sphere.rotateOnAxis(x_axis, rotate_x*3.0/360.0*2.0*Math.PI);
		sphere.rotateOnAxis(z_axis, rotate_z*3.0/360.0*2.0*Math.PI);

		requestAnimationFrame(animate);
	}

	function buildAxes(length) {
		var axes = new THREE.Object3D();

		axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X
		axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
		axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y
		axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
		axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), 0x0000FF, false)); // +Z
		axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z

		return axes;
	}

	function buildAxis(src, dst, colorHex, dashed) {
		var geom = new THREE.Geometry(), mat;

		if(dashed) {
			mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
		} else {
			mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
		}

		geom.vertices.push( src.clone() );
		geom.vertices.push( dst.clone() );
		geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

		var axis = new THREE.Line( geom, mat, THREE.LinePieces );

		return axis;
	}
}
