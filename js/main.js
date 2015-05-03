/*
 * Requires THREE.js
 */

(function(domElement) {

  var Spheye = function() {
    this.scene = new THREE.Scene();

    // init renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    domElement.document.body.appendChild(this.renderer.domElement);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // init camera
    this.camera = new THREE.PerspectiveCamera(45, (window.innerWidth/window.innerHeight), 1, 10000);
    this.camera.position.set(-5, 100, -100);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // init controls
    this.controls = new THREE.TrackballControls(this.camera);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 0.2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;

    // init sphere rotation state
    this.rotation_vector = new THREE.Vector3(0, 0, 0);
    this.rotation_quaternion = new THREE.Quaternion();

    this.init_projection();
  };

  Spheye.prototype.key_down = function(event) {
    switch (event.keyCode) {
      case 37: this.rotation_vector.z = -1.0; break; // left
      case 38: this.rotation_vector.x = 1.0; break; // up
      case 39: this.rotation_vector.z = 1.0; break; // right
      case 40: this.rotation_vector.x = -1.0; break; // down
    }
  };

  Spheye.prototype.init_projection = function() {
    this.radius = 10;

    var box = new THREE.BoxGeometry(this.radius, this.radius, this.radius, this.radius, this.radius, this.radius);
    for (var i = 0; i < box.faces.length; i++) {
       box.faces[i].color.setHex(i/box.faces.length * 0xffffff);
       box.faces[i].materialIndex = 0;
    }
    var eyeTexture = new THREE.ImageUtils.loadTexture("img/eye.png");
	eyeTexture.wrapS = THREE.MirroredRepeatWrapping;
	eyeTexture.wrapT = THREE.MirroredRepeatWrapping;
	eyeTexture.repeat.set(8,8);
	var eyeMat = [new THREE.MeshBasicMaterial({ map: eyeTexture })];
	var eye = new THREE.MeshFaceMaterial(eyeMat);

    this.cube = new THREE.Mesh(box, eye);
    this.cube.position.set(0, this.radius, 0);
    this.cube.matrixAutoUpdate = true;
    this.scene.add(this.cube);

    var projcubegeom = this.proj_cube_sphere(this.cube.geometry.clone(), this.radius);
    var projcubemat = this.cube.material.clone();
    projcubemat.transparent = true;
    projcubemat.opacity = 0.5;

    this.projcube = new THREE.Mesh(projcubegeom, projcubemat);
    this.projcube.position.set(0, this.radius, 0);
    this.projcube.matrixAutoUpdate = true;
    this.scene.add(this.projcube);

    var plaingeom = this.proj_sphere_plain(this.projcube.geometry.clone());
    var plain = new THREE.Mesh(plaingeom, eye);
    plain.matrixAutoUpdate = true;
    plain.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI);
    this.scene.add(plain);
  };


  Spheye.prototype.proj_sphere_plain = function(geom) {
    vertices = geom.vertices;

    for (j = 0; j < vertices.length; ++j) {
      vertex = vertices[j];
      x = vertex.x;
      y = vertex.y + this.radius;
      z = vertex.z;

      if (Math.floor(x+0.4999) === 0 && Math.floor(z+0.4999) === 0) {
       continue;
      }

      phi = Math.atan2(Math.sqrt(x*x+z*z), 2*this.radius-y);
      r = 2*this.radius*Math.tan(phi);

      theta = Math.atan2(x, z);
      a = r * Math.sin(theta);
      b = r * Math.cos(theta);

      vertex.x = a;
      vertex.y = 0;
      vertex.z = b;
      vertices[j] = vertex;
    }
    return geom;
  };

  Spheye.prototype.proj_cube_sphere = function(geom, size) {
    vertices = geom.vertices;

    for (j = 0; j < vertices.length; ++j) {
      vertex = vertices[j];
      x = vertex.x/size*2;  // dont know why *2 but it works
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

  Spheye.prototype.create_sphere = function(radius) {
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

  Spheye.prototype.rotate = function() {
    var drag = 0.99;
    var minDelta = 0.05;
    var angle  = 3.0/360.0*2.0*Math.PI;

    vec = this.rotation_vector;
    vec.x = (vec.x < -minDelta || vec.x > minDelta) ? vec.x*drag : 0.0;
    vec.z = (vec.z < -minDelta || vec.z > minDelta) ? vec.z*drag : 0.0;

    this.rotation_quaternion.setFromAxisAngle(vec, angle);
    q = this.cube.quaternion;
    q.multiplyQuaternions(this.rotation_quaternion, q);
    q.normalize();

    this.cube.setRotationFromQuaternion(q);
    this.projcube.setRotationFromQuaternion(q);
  }

  Spheye.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
  };

  Spheye.prototype.update = function() {
    this.controls.update();
    this.rotate();
  };

  window.Spheye = Spheye;

})(window);
