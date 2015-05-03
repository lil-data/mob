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
    this.radius = 20;
    this.rotation_vector = new THREE.Vector3(0, 0, 0);
    this.rotation_quaternion = new THREE.Quaternion();

    this.init_projection();
  };

  Spheye.prototype.init_projection = function() {

    var box = new THREE.BoxGeometry(
        this.radius, this.radius, this.radius, 10, 10, 10);

    for (var i = 0; i < box.faces.length; i++) {
       box.faces[i].color.setHex(i/box.faces.length * 0xffffff);
       // box.faces[i].materialIndex = 0;
    }

    var eyeTexture = new THREE.ImageUtils.loadTexture("img/eye.png");
    eyeTexture.wrapS = THREE.MirroredRepeatWrapping;
    eyeTexture.wrapT = THREE.MirroredRepeatWrapping;
    eyeTexture.repeat.set(8,8);
    var eyeMat = [new THREE.MeshBasicMaterial({ map: eyeTexture })];
    // var eye = new THREE.MeshFaceMaterial(eyeMat);
    var eye = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );

    var cube = new THREE.Mesh(box, eye);

    // sphere
    this.sphere = new THREE.Mesh(
        this.get_sphere_geom_from_cube(cube.geometry.clone(), this.radius),
        cube.material.clone());
    this.sphere.position.set(0, this.radius, 0);
    this.sphere.geometry.mergeVertices();
    this.scene.add(this.sphere);

    // plane
    var sphere_geom = this.sphere.geometry.clone();
    for (i = 0; i < sphere_geom.vertices.length; ++i) {
      world_vertex = this.sphere.localToWorld(sphere_geom.vertices[i]).clone();
      world_vertex.y += this.radius;
    }

    this.plane = new THREE.Mesh(
        this.get_plane_geom_from_sphere(sphere_geom), eye);

    this.plane.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI);
    this.scene.add(this.plane);
  };

  Spheye.prototype.get_sphere_geom_from_cube = function(geom, size) {
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

  Spheye.prototype.get_plane_geom_from_sphere = function(geom) {
    vertices = geom.vertices;

    for (j = 0; j < vertices.length; ++j) {
      vertex = vertices[j];
      x = vertex.x;
      y = vertex.y;
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

  Spheye.prototype.rotate = function() {
    var drag = 0.99;
    var minDelta = 0.05;
    var angle  = 3.0/360.0*2.0*Math.PI;

    vec = this.rotation_vector;
    vec.x = (vec.x < -minDelta || vec.x > minDelta) ? vec.x*drag : 0.0;
    vec.z = (vec.z < -minDelta || vec.z > minDelta) ? vec.z*drag : 0.0;

    this.rotation_quaternion.setFromAxisAngle(vec, angle);
    q = this.sphere.quaternion;
    q.multiplyQuaternions(this.rotation_quaternion, q);
    q.normalize();

    this.sphere.setRotationFromQuaternion(q);

    var sphere_geom = this.sphere.geometry.clone();
    for (i = 0; i < sphere_geom.vertices.length; ++i) {
      world_vertex = this.sphere.localToWorld(sphere_geom.vertices[i]).clone();
      world_vertex.y += this.radius;
    }

    this.plane.geometry = this.get_plane_geom_from_sphere(sphere_geom);
  }

  Spheye.prototype.key_down = function(event) {
    switch (event.keyCode) {
      case 37: this.rotation_vector.z = -1.0; break; // left
      case 38: this.rotation_vector.x = 1.0; break; // up
      case 39: this.rotation_vector.z = 1.0; break; // right
      case 40: this.rotation_vector.x = -1.0; break; // down
    }
  };

  Spheye.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
  };

  Spheye.prototype.update = function() {
    this.controls.update();
    this.rotate();
  };

  window.Spheye = Spheye;

})(window);
