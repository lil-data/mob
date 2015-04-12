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

	size = 10;
	var box = new THREE.BoxGeometry(size, size, size, size, size, size);
	for (var i = 0; i < box.faces.length; i++) {
    	box.faces[i].color.setHex(i/box.faces.length * 0xffffff);
	}
	var mat = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});
	var cube = new THREE.Mesh(box,mat);
	cube.position.set(0, size, 0);
	scene.add(cube);

	var projcubegeom = proj_cube_sphere(cube.geometry.clone(), size);
	var projcubemat = cube.material.clone();
	projcubemat.transparent = true;
	projcubemat.opacity = 0.5;
	var projcube = new THREE.Mesh(projcubegeom, projcubemat);
	projcube.position.set(0, size, 0);
	scene.add(projcube);

	scene.add(buildAxes(1000));
	var sphere_radius = 10;
	var sphere = create_sphere(sphere_radius);
	// scene.add(sphere);

	var geom = proj_sphere_plain(projcube.geometry.clone());
	matPoints = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );
	matPoints = sphere.material.clone();
	matPoints.opacity = 1;
	var points = new THREE.Mesh(geom, matPoints);
	points.rotateOnAxis(z_axis, Math.PI);
	scene.add(points);
	
	camera();
	controls();
	animate();

	function proj_sphere_plain(geom) {

		vertices = geom.vertices;

		for (j = 0; j < vertices.length; ++j) {
			vertex = vertices[j];
			x = vertex.x;
			y = vertex.y + sphere_radius;
			z = vertex.z;

			if (Math.floor(x+0.4999) === 0 && Math.floor(z+0.4999) === 0) {
				continue;
			}

			phi = Math.atan2(Math.sqrt(x*x+z*z), 2*sphere_radius-y);
			r = 2*sphere_radius*Math.tan(phi);

			theta = Math.atan2(x, z);
			a = r * Math.sin(theta);
			b = r * Math.cos(theta);

			vertex.x = a;
			vertex.y = 0;
			vertex.z = b;
			vertices[j] = vertex;
		}
		return geom;
	}

	function proj_cube_sphere(geom, size) {
		
		vertices = geom.vertices;

		for (j = 0; j < vertices.length; ++j) {
			vertex = vertices[j];
			x = vertex.x/size*2;
			y = vertex.y/size*2;
			z = vertex.z/size*2;

			xx = x*Math.sqrt(1-((y*y)/2)-((z*z)/2)+((y*y*z*z)/3));
			yy = y*Math.sqrt(1-((z*z)/2)-((x*x)/2)+((x*x*z*z)/3));
			zz = z*Math.sqrt(1-((x*x)/2)-((y*y)/2)+((y*y*x*x)/3));

			vertex.x = xx*size;
			vertex.y = yy*size;
			vertex.z = zz*size;
			vertices[j] = vertex;
		}
		return geom;
	}

	function create_sphere(radius) {
		geometry = new THREE.SphereGeometry(radius, 100, 100);
		for ( var i = 0; i < geometry.faces.length; i ++ ) {
    		geometry.faces[ i ].color.setHex( i/geometry.faces.length * 0xffffff );
		}
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );
		material.transparent = true;
		material.opacity = 0.5;
		sphere = new THREE.Mesh(geometry, material);
		sphere.position.set(0, radius, 0);
		sphere.geometry.mergeVertices();
		return sphere;
	}

	function rotate() {
		if (Math.abs(rotate_x) > 0 || Math.abs(rotate_z) > 0) {
			cube.rotateOnAxis(x_axis, rotate_x*3.0/360.0*2.0*Math.PI);
			cube.rotateOnAxis(z_axis, rotate_z*3.0/360.0*2.0*Math.PI);
		}
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
		rotate();
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
		stats.end();
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
