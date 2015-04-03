window.onload = function() {

	// fps display
	var stats = new Stats();
	stats.setMode(2);
	document.body.appendChild(stats.domElement);
	document.getElementById("stats").style.position = "absolute";

	// keyboard input handlers
	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);

	var renderer, scene, camera, control, meshMaterial;
	renderer = new THREE.WebGLRenderer({antialias: true});
	document.body.appendChild( renderer.domElement );
	renderer.setSize(window.innerWidth, window.innerHeight);

	scene = new THREE.Scene();

	var x_axis = new THREE.Vector3(1, 0, 0);
	var z_axis = new THREE.Vector3(0, 0, 1);
	var rotate_x = 0.0;
	var rotate_z = 0.0;

	scene.add(buildAxes(1000));
	// scene.add(create_floor());
	sphere = create_sphere();
	scene.add(sphere);

	// Create points
	vertices = sphere.geometry.vertices;
	var geom = new THREE.Geometry();
	for (i = 0; i < vertices.length; ++i) {
		x = vertices[i].x;
		y = vertices[i].y;
		z = vertices[i].z;

		if (Math.floor(x+0.4999) === 0 && Math.floor(z+0.4999) === 0) continue;

		theta = Math.atan2(z, x);

		phi = Math.atan2(25-y, Math.sqrt(x*x+z*z));
		console.log(theta, phi);

		cot_phi = 1 / Math.tan(phi/2);
		a = cot_phi * Math.sin(theta);
		b = cot_phi * Math.cos(theta);

		geom.vertices.push(new THREE.Vector3(b, -25, a));
	}

	material = new THREE.PointCloudMaterial({
		size: 2,
		color: 0xffff0f});
	var pointcloud = new THREE.PointCloud(geom, material );
	scene.add(pointcloud);


	camera();
	controls();
	animate();

	function create_sphere() {
		radius = 25;

		geometry = new THREE.SphereGeometry(radius, 25, 25);
		material = new THREE.MeshBasicMaterial({
				wireframe: true,
				wireframeLinewidth: 3
			});

		sphere = new THREE.Mesh(geometry, material);
		// sphere.position.set(0, radius, 0);
		sphere.geometry.mergeVertices();
		return sphere;
	}

	function create_floor() {
		floor = new THREE.Geometry();
		scale = 100.0;

		for (i = -2; i < 3; ++i) {
			for (j = -2; j < 3; ++j) {
				floor.vertices.push(new THREE.Vector3(scale*j, 0, scale*i));
			}
		}

		for (k = 0; k < 16; ++k) {
			i = k + Math.floor(k/4);
			floor.faces.push(new THREE.Face3(i, i+1, i+5));
		}

		return new THREE.Mesh(floor, new THREE.MeshBasicMaterial({wireframe: true}));
	}

	function camera() {
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set(-5, 100, -100);
		camera.lookAt( new THREE.Vector3(0, 0, 0) );
	}

	function controls() {
		control = new THREE.TrackballControls( camera );
		control.rotateSpeed = 1.0;
		control.zoomSpeed = 0.2;
		control.panSpeed = 0.8;
		control.noZoom = false;
		control.noPan = false;
		control.staticMoving = true;
		control.dynamicDampingFactor = 0.3;
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
		control.update();
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
};
