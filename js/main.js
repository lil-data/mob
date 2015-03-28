window.onload = function() {

	// fps display
	var stats = new Stats();
	stats.setMode(2);
	document.body.appendChild(stats.domElement);
	document.getElementById("stats").style.position = "absolute";

	document.addEventListener("keydown", onKeyDown); // keyboard input handler

	var renderer, scene, camera, controls, meshMaterial;

	renderer = new THREE.WebGLRenderer({ antialias: true });
	document.body.appendChild( renderer.domElement );
	renderer.setSize( window.innerWidth, window.innerHeight );

	scene = new THREE.Scene();

	// sphere
	// var sphere = new THREE.Mesh(new THREE.SphereGeometry(25, 25, 25), new THREE.MeshNormalMaterial());
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(25, 25, 25), new THREE.MeshBasicMaterial({wireframe:true}));
	sphere.position.set(0, 0, 0);
	sphere.overdraw = true;
	scene.add(sphere);

	var pSphere = new THREE.Mesh(new THREE.SphereGeometry(25, 25, 25), new THREE.MeshBasicMaterial({wireframe:true}));
	pSphere.position.set(0, 0, 0);
	pSphere.overdraw = true;
	scene.add(pSphere);

	mobius(pSphere.geometry.vertices, pSphere.geometry.faces);

	// axes
	axes = buildAxes( 1000 );
	scene.add( axes );

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
		camera.position.set(-100, -75, -100);
		camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
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

	function onKeyDown(event) {
		if (event.keyCode == 37) {
			console.log('Left was pressed');
		}
		else if(event.keyCode == 39) {
			console.log('Right was pressed');
		}
	}

	function animate() {
		stats.begin();
		controls.update();
		renderer.render(scene, camera);
		stats.end();

		requestAnimationFrame(animate);
		console.log(camera.position);
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
