window.onload = function() {
	var renderer,
		scene,
		camera,
		controls,
		meshMaterial;

	renderer = new THREE.WebGLRenderer({ antialias: true });
	document.body.appendChild( renderer.domElement );
	renderer.setSize( window.innerWidth, window.innerHeight );
	// renderer.setClearColorHex( 0xeeeeee, 1.0 );

	scene = new THREE.Scene();
	
	// Add some objects to the scene, one per quadrant
	meshMaterial = new THREE.MeshBasicMaterial({ color: 0xFF00FF, wireframe: true });

	var sphere = new THREE.Mesh(new THREE.SphereGeometry(25, 25, 25), new THREE.MeshNormalMaterial());
	sphere.position.set( 0, 25, 0 );
	sphere.overdraw = true;
	scene.add( sphere );

	// Add axes
	axes = buildAxes( 1000 );
	scene.add( axes );
	
	// We need a camera to look at the scene!
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 30, 50, 120 );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
	
	// And some sort of controls to move around
	// We'll use one of THREE's provided control classes for simplicity
	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 0.2;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;


	// and go!
	animate();

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		renderer.render( scene, camera );
	}

	function buildAxes( length ) {
		var axes = new THREE.Object3D();

		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

		return axes;
	}

	function buildAxis( src, dst, colorHex, dashed ) {
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
