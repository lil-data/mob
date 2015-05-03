
window.onload = function() {

	// globals (gl_)
	var gl_scene;
	var gl_renderer;
	var gl_camera;
	var gl_controls;
	var gl_fps_stats;
	var gl_rotation_vector;
	var gl_rotation_quaternion;
	var gl_sphere_radius;

	init();
	init_projection();

	scene_render();
	scene_update();

	////////////////////////////////////////////////////////////////////////////
	// Setup
	////////////////////////////////////////////////////////////////////////////
	function init() {
		// init scene
		gl_scene = new THREE.Scene();

		// init renderer
		gl_renderer = new THREE.WebGLRenderer({antialias: true});
		document.body.appendChild(gl_renderer.domElement);
		gl_renderer.setSize(window.innerWidth, window.innerHeight);

		// init camera
		gl_camera = new THREE.PerspectiveCamera(45, (window.innerWidth/window.innerHeight), 1, 10000);
		gl_camera.position.set(-5, 100, -100);
		gl_camera.lookAt(new THREE.Vector3(0, 0, 0));

		// init controls
		gl_controls = new THREE.TrackballControls(gl_camera);
		gl_controls.rotateSpeed = 1.0;
		gl_controls.zoomSpeed = 0.2;
		gl_controls.panSpeed = 0.8;
		gl_controls.noZoom = false;
		gl_controls.noPan = false;
		gl_controls.staticMoving = true;
		gl_controls.dynamicDampingFactor = 0.3;

		// init fps counter
		gl_fps_stats = new Stats();
		gl_fps_stats.setMode(2);
		document.body.appendChild(gl_fps_stats.domElement);
		document.getElementById("stats").style.position = "absolute";

		// add keyboard input handlers
		document.addEventListener("keydown", on_key_down);

		// init sphere rotation state
		gl_rotation_vector = new THREE.Vector3(0, 0, 0);
		gl_rotation_quaternion = new THREE.Quaternion();

		// init sphere properties
		gl_sphere_radius = 10;
	}


	////////////////////////////////////////////////////////////////////////////
	// Main Processing
	////////////////////////////////////////////////////////////////////////////

	function scene_render() {
		gl_fps_stats.begin();
		gl_renderer.render(gl_scene, gl_camera);
		gl_fps_stats.end();

		requestAnimationFrame(scene_render);
	}

	function scene_update() {
		gl_controls.update();
		rotate();
		setTimeout(scene_update, 1000/60); // 60 fps
	}

	function on_key_down(event) {
		switch (event.keyCode) {
			case 37: gl_rotation_vector.z = -1.0; break; // left
			case 38: gl_rotation_vector.x = 1.0; break; // up
			case 39: gl_rotation_vector.z = 1.0; break; // right
			case 40: gl_rotation_vector.x = -1.0; break; // down
		}
	}

	function rotate() {
		var drag = 0.99;
		var minDelta = 0.05;
		var angle  = 3.0/360.0*2.0*Math.PI;

		vec = gl_rotation_vector;
		vec.x = (vec.x < -minDelta || vec.x > minDelta) ? vec.x*drag : 0.0;
		vec.z = (vec.z < -minDelta || vec.z > minDelta) ? vec.z*drag : 0.0;

		gl_rotation_quaternion.setFromAxisAngle(vec, angle);
		curQuaternion = cube.quaternion;
		curQuaternion.multiplyQuaternions(gl_rotation_quaternion, curQuaternion);
		curQuaternion.normalize();
		cube.setRotationFromQuaternion(curQuaternion);
		projcube.setRotationFromQuaternion(curQuaternion);

		projcube.updateMatrixWorld();

		// console.log(projcube.vertices);
		// this does something kind of interesting
		// for (var i = 0; i < projcube.geometry.vertices.length; i++) {
		// 	projcube.localToWorld(projcube.geometry.vertices[i]);
		// };
		// plain.geometry = proj_sphere_plain(projcube.geometry.clone());
	}

	////////////////////////////////////////////////////////////////////////////
	// Projection Rendering
	////////////////////////////////////////////////////////////////////////////

	function init_projection() {
		size = 10;
		var box = new THREE.BoxGeometry(size, size, size, size, size, size);
		for (var i = 0; i < box.faces.length; i++) {
	    	box.faces[i].color.setHex(i/box.faces.length * 0xffffff);
		}
		var mat = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});
		var cube = new THREE.Mesh(box,mat);
		cube.position.set(0, size, 0);
		cube.matrixAutoUpdate = true;
		gl_scene.add(cube);

		var projcubegeom = proj_cube_sphere(cube.geometry.clone(), size);
		var projcubemat = cube.material.clone();
		projcubemat.transparent = true;
		projcubemat.opacity = 0.5;

		var projcube = new THREE.Mesh(projcubegeom, projcubemat);
		projcube.position.set(0, size, 0);
		projcube.matrixAutoUpdate = true;
		gl_scene.add(projcube);

		var plaingeom = proj_sphere_plain(projcube.geometry.clone());
		plainmat = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );
		plainmat.opacity = 1;
		var plain = new THREE.Mesh(plaingeom, plainmat);
		plain.matrixAutoUpdate = true;
		plain.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI);
		gl_scene.add(plain);
	}

	function proj_sphere_plain(geom) {

		vertices = geom.vertices;

		for (j = 0; j < vertices.length; ++j) {
			vertex = vertices[j];
			x = vertex.x;
			y = vertex.y + gl_sphere_radius;
			z = vertex.z;

			if (Math.floor(x+0.4999) === 0 && Math.floor(z+0.4999) === 0) {
				continue;
			}

			phi = Math.atan2(Math.sqrt(x*x+z*z), 2*gl_sphere_radius-y);
			r = 2*gl_sphere_radius*Math.tan(phi);

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
			x = vertex.x/size*2;	// dont know why *2 but it works
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
};
