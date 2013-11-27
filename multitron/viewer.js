
/*
TODO:
 - Crash effect (particle system?)
 - 3D trail
 - Animate trail disappearing
*/

// *********************************************************************
// Globals
// *********************************************************************

// Config constants
var time_per_round = 220; //ms, animation time between rounds
var readysteadygo_time = 1000; //ms, time before the first round starts
var usingWebGl = !isTrue(getURLParameter("nowebgl")); //Disable WebGL
var mute = isTrue(getURLParameter("mute")); //Disable audio
var ascii = isTrue(getURLParameter("ascii")); //An easter egg :P
var assignatura = getURLParameter("ass"); //Not used, but given as paramter sometimes
var print_adjacency_matrix = false; //The game runner needs it
var map_transparency = 0.8;
var player_colors = {
    0: "#BB3333",
    1: "#22EE11",
    2: "#33AAEE",
    3: "#BB11BB"
}

// Game data
var data = { } //Object for storing all the game data
var board; //A Three.JS mesh
var bikes = []; //All the instances of the Bike class
var bonus = []; //All the instances of the Bonus class

// Viewer state
var gamePaused = true;
var gamePreview = false; //If true, update will be called for the next tick even if game is paused, and then will be set to false
var actRound = 0; //Current round index
var last_time = Date.now();
var last_update = Date.now();
var next_update = Date.now();

// ThreeJS rendering stuff
var container;
var camera, scene, renderer, effect;
var stats;
var controls, keyboard;
var pointLight;

var bonus_textures = {
    'p': textureFromBase64('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAFQSURBVHhe7dpBCsJAEADB6AP8/zv9gCaQgLeoh7HBKlj0KDYzBN3L4748FjKu+ysRgsQIEiNIjCAxgsQIEiNIjCAxgsQIEiNIjCAxgsQIEiNIzNgfVJfb/iZq/R4STEiMIDFW1onpVWZCYgSJEeTEtmqPM0GQGEFick9ZU08136ygic9mQmIEifnblfWqtL5MSIwgMYKstvVznF8TJEaQGEFiBIkRJEaQGEFiBIkRJEaQGEFiBFltP78f59cEiREkxiWHD0x8NhMSI0iM2+8fsLL+kCAxgpzY1tRxJggSI0iMp6zd1Eo6Y0JiBIlx+z3GhMQIEiNIjCAxgsQIEiNIjCAxgsQIEiNIjCAxgsQIEiNIjCAxgsQIEiNIjCAxgsQIEiNIjCAxgsQIEjN2lZT3mJAYQWIEiREkRpAYQWIEiREkRpAYQWIEiREkRpCUZXkCN1VAH0/ViKcAAAAASUVORK5CYII='),
    'g': textureFromBase64('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGGSURBVHhe7dlBjoMwEAVRkntxei6WSFgsgkJcxt0mqN5mZlaQkr9AmceyLJPqPMtPVTAWYCzAWICxAGMBxgKMBRgLMBZgLMBYgLEAYwHGAowFjPzyb57n8hs06p49WYCxgPAZNm+tTejH8WQBxgKiZpi8vr2Iz+XJAowFdJ4hXV/D1RMu8Y0nCzAW0GeGldOIeEK9pV3dkwUYCzg1w7Hr24u+H08WYCwgcIZp69sLujFPFmAswFiAsQBjAS1Pw8s+BKN5sgBjAcYCjAUYCzAWYCzAWMDVX0orv/xE/Iomg7EAYwHGAowFGAswFmAs4J7flPp/w/GMBfjve8CTBRgLuFWs9/pW5e/ePFmAsYDAWGUSYaPI58kCjAWceindVG4t6DWVLt2X0gzGAvrMcJOwiPOPV2eYwVhA5xluRr2Lrh/n+OrOMIOxgKgZbnL2+PEpnOF4xgLCZ3igeaE/79kZjmcsYOQM/44nCzAWYCzAWICxAGMBxgKMBRgLMBZgLMBYgLGqTdMLvGmCI5WaFuEAAAAASUVORK5CYII='),
    't': textureFromBase64('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAEqSURBVHhe7dyxDcIwFEBBwwq0lOw/EWVaZkgoPAAFli7Ru8au8/QLy5Fvn+drH2Hc5xpEQTAFwRQEUxBMQTAFwRQEUxBMQTAFwRQEUxBMQTAFwRQEUxBMQTBLrnAf23vuru377ebuf5oQTEEwBcEUBFMQTEEwBcEUBHPKf3t/PXiuOLit1oRgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCKYgmIJgCoIpCOaUb79fWROCKQimIJiCYAqCKQimIJiCYAqCKQimIJQxDjfKD3VDI8i1AAAAAElFTkSuQmCC'),
}

var bgm = new Audio('snd/tron.ogg');
var sfx_crash = new Audio('snd/crash.ogg');
sfx_crash.volume = 0.4;
var sfx_bonus = new Audio('snd/bonus.ogg');

// *********************************************************************
// Utility functions
// *********************************************************************

function getURLParameter (name) {
    // http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
    var a = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    if (a != null) return decodeURI(a);
    return null;
}

function isTrue(b) {
    return (b === true || b === "1" || b === "true");
}

//Callback has a single parameter with the file contents
function loadFile (file, callback) {

    var xmlhttp;

    if (file == null || file == "") {
        alert("You must specify a file to load");
        return;
    }

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    // http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            //Note: We can not check xmlhttp.status != 200 for errors because status is not set when loading local files
            callback(xmlhttp.responseText);
        }
    }

    xmlhttp.open("GET", file, false);
    xmlhttp.send();
}

function int (s) {
    return parseInt(s);
}

function double (s) {
    return parseFloat(s);
}

function sort_unique (arr) {
    arr = arr.sort();
    var ret = [arr[0]];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i-1] !== arr[i]) {
            ret.push(arr[i]);
        }
    }
    return ret;
}

function textureFromBase64(base64) {
    var img = new Image();
    img.src = base64;
    var texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    return texture;
}

// *********************************************************************
// Math functions
// *********************************************************************

//Get a random element from an array
function sample (arr) {
    return arr[Math.floor(Math.random()*arr.length)];
}

//Interpolation between two vertices (and their two normals)
function lerp (from, to, fraction) {
    var ret = to.clone().lerp(from,fraction);
    ret.normal = to.normal.clone().lerp(from.normal,fraction);
    return ret;
}

//Returns a copy of the vertex with its normal added
THREE.Vector3.prototype.plusNormal = function(multiplier) {
    var ret = this.normal.clone().multiplyScalar(multiplier || 1).add(this);
    ret.normal = this.normal.clone();
    return ret;
}

THREE.Vector3.UnitX = new THREE.Vector3(1,0,0);
THREE.Vector3.UnitY = new THREE.Vector3(0,1,0);
THREE.Vector3.UnitZ = new THREE.Vector3(0,0,1);

THREE.Matrix4.prototype.translate = function ( v ) {

    var te = this.elements;
    var x = v.x, y = v.y, z = v.z;

    te[12] = te[0] * x + te[4] * y + te[8] * z + te[12];
    te[13] = te[1] * x + te[5] * y + te[9] * z + te[13];
    te[14] = te[2] * x + te[6] * y + te[10] * z + te[14];
    te[15] = te[3] * x + te[7] * y + te[11] * z + te[15];

    return this;

}

THREE.Matrix4.prototype.rotateX = function ( angle ) {

    var te = this.elements;
    var m12 = te[4];
    var m22 = te[5];
    var m32 = te[6];
    var m42 = te[7];
    var m13 = te[8];
    var m23 = te[9];
    var m33 = te[10];
    var m43 = te[11];
    var c = Math.cos( angle );
    var s = Math.sin( angle );

    te[4] = c * m12 + s * m13;
    te[5] = c * m22 + s * m23;
    te[6] = c * m32 + s * m33;
    te[7] = c * m42 + s * m43;

    te[8] = c * m13 - s * m12;
    te[9] = c * m23 - s * m22;
    te[10] = c * m33 - s * m32;
    te[11] = c * m43 - s * m42;

    return this;

}

THREE.Matrix4.prototype.rotateY = function ( angle ) {

    var te = this.elements;
    var m11 = te[0];
    var m21 = te[1];
    var m31 = te[2];
    var m41 = te[3];
    var m13 = te[8];
    var m23 = te[9];
    var m33 = te[10];
    var m43 = te[11];
    var c = Math.cos( angle );
    var s = Math.sin( angle );

    te[0] = c * m11 - s * m13;
    te[1] = c * m21 - s * m23;
    te[2] = c * m31 - s * m33;
    te[3] = c * m41 - s * m43;

    te[8] = c * m13 + s * m11;
    te[9] = c * m23 + s * m21;
    te[10] = c * m33 + s * m31;
    te[11] = c * m43 + s * m41;

    return this;

}

THREE.Matrix4.prototype.rotateZ = function ( angle ) {

    var te = this.elements;
    var m11 = te[0];
    var m21 = te[1];
    var m31 = te[2];
    var m41 = te[3];
    var m12 = te[4];
    var m22 = te[5];
    var m32 = te[6];
    var m42 = te[7];
    var c = Math.cos( angle );
    var s = Math.sin( angle );

    te[0] = c * m11 + s * m12;
    te[1] = c * m21 + s * m22;
    te[2] = c * m31 + s * m32;
    te[3] = c * m41 + s * m42;

    te[4] = c * m12 - s * m11;
    te[5] = c * m22 - s * m21;
    te[6] = c * m32 - s * m31;
    te[7] = c * m42 - s * m41;

    return this;

}

THREE.Matrix4.prototype.rotateByAxis = function ( axis, angle ) {

    var te = this.elements;

    var x = axis.x, y = axis.y, z = axis.z;
    var n = Math.sqrt(x * x + y * y + z * z);

    x /= n;
    y /= n;
    z /= n;

    var xx = x * x, yy = y * y, zz = z * z;
    var c = Math.cos( angle );
    var s = Math.sin( angle );
    var oneMinusCosine = 1 - c;
    var xy = x * y * oneMinusCosine;
    var xz = x * z * oneMinusCosine;
    var yz = y * z * oneMinusCosine;
    var xs = x * s;
    var ys = y * s;
    var zs = z * s;

    var r11 = xx + (1 - xx) * c;
    var r21 = xy + zs;
    var r31 = xz - ys;
    var r12 = xy - zs;
    var r22 = yy + (1 - yy) * c;
    var r32 = yz + xs;
    var r13 = xz + ys;
    var r23 = yz - xs;
    var r33 = zz + (1 - zz) * c;

    var m11 = te[0], m21 = te[1], m31 = te[2], m41 = te[3];
    var m12 = te[4], m22 = te[5], m32 = te[6], m42 = te[7];
    var m13 = te[8], m23 = te[9], m33 = te[10], m43 = te[11];

    te[0] = r11 * m11 + r21 * m12 + r31 * m13;
    te[1] = r11 * m21 + r21 * m22 + r31 * m23;
    te[2] = r11 * m31 + r21 * m32 + r31 * m33;
    te[3] = r11 * m41 + r21 * m42 + r31 * m43;

    te[4] = r12 * m11 + r22 * m12 + r32 * m13;
    te[5] = r12 * m21 + r22 * m22 + r32 * m23;
    te[6] = r12 * m31 + r22 * m32 + r32 * m33;
    te[7] = r12 * m41 + r22 * m42 + r32 * m43;

    te[8] = r13 * m11 + r23 * m12 + r33 * m13;
    te[9] = r13 * m21 + r23 * m22 + r33 * m23;
    te[10] = r13 * m31 + r23 * m32 + r33 * m33;
    te[11] = r13 * m41 + r23 * m42 + r33 * m43;

    return this;

}

THREE.Matrix4.prototype.scale = function ( v ) {

    var te = this.elements;
    var x = v.x, y = v.y, z = v.z;

    te[0] *= x; te[4] *= y; te[8] *= z;
    te[1] *= x; te[5] *= y; te[9] *= z;
    te[2] *= x; te[6] *= y; te[10] *= z;
    te[3] *= x; te[7] *= y; te[11] *= z;

    return this;

}

// *********************************************************************
// Debug functions
// *********************************************************************

var default_line_color = 0xff0000;
function draw_line (from, to, color) {
    color = color || default_line_color;
    var geometry = new THREE.Geometry();
    geometry.vertices.push(from);
    geometry.vertices.push(to);
    this.normal_geometry = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: color }));
    scene.add(this.normal_geometry);
    return this.normal_geometry;
}

THREE.Vector3.prototype.debug_normal = function(b) {
    if (!this.normal) return "Normal not computed";
    if (b) {
        if (this.normal_geometry) return;
        this.normal_geometry = draw_line(this, this.plusNormal(0.5));
    } else {
        if (this.normal_geometry) scene.remove(this.normal_geometry);
        this.normal_geometry = null;
    }
}

THREE.Vector3.prototype.debug_neighbours = function(b) {
    if (!this.neighbours) return "Neighbours not assigned";
    for (i in this.neighbours) {
        var n = this.neighbours[i];
        board.vertices[n].debug_normal(b);
    }
}

function e(n) { board.vertices[n].debug_normal(true); }
function d(n) { board.vertices[n].debug_normal(false); }

// *********************************************************************
// Event handlers
// *********************************************************************

function onWindowResize () {

    var width = window.innerWidth;
    var height = window.innerHeight - 110;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    if (effect) effect.setSize( width, height );

}

// *********************************************************************
// Game elements
// *********************************************************************

// BIKE CLASS
// ==========
SimpleCurve = THREE.Curve.create(
    function ( points ) {
        this.points = points;
    },
    function ( percent ) {
        var point = int(( this.points.length - 1 ) * percent);
        return this.points[point];
    }
);


function Bike (id) {

    this.id = id;
    this.player = data.rounds[0].bikes[id].player;
    var color = player_colors[this.player];

    this.last_alive = data.nb_rounds;
    for (var i = 0; i < data.nb_rounds; i++) {
        if (!data.rounds[i].bikes[this.id].alive) {
            this.last_alive = i;
            break;
        }
    }

    this.was_alive = true;
    this.was_ghost = false;
    this.was_turbo = false;
    this.was_withitem = false;
    this.last_item = null;

    this.material;
    if (usingWebGl) {
        this.material = new THREE.MeshLambertMaterial( { color: color, ambient: color, shading: color } );
    } else {
        this.material = new THREE.MeshBasicMaterial( { color: color } );
    }
    this.mesh = new THREE.Mesh( bike_geometry, this.material );
    scene.add( this.mesh );

    //Create dynamic tail (the part from the current node to the bike, that grows as the bike moves)
    var material = new THREE.MeshBasicMaterial( { color: color, side: THREE.DoubleSide } );
    this.dynamicTail = new THREE.PlaneGeometry(0,0,0,0);
    this.dynamicTail_mesh = new THREE.Mesh(this.dynamicTail, material);
    scene.add(this.dynamicTail_mesh);

    //Create static tail (the part from the first node to the current node)
    this.staticTail = [null];
    if (false && usingWebGl) { //3D trail
        var last_geometry = null;
        var first_vertex = createWall(data.rounds[0].bikes[id].vertex,data.rounds[0].bikes[id].vertex);
        for (var i = 0; i <= this.last_alive; i++) {
            var round = data.rounds[i].bikes[this.id];
            var vertex = board.vertices[round.vertex];
            var next_vertex = board.vertices[round.next_vertex];
            var tube = createWall(vertex, next_vertex);
            if (last_geometry == null) last_geometry = tube;
            else THREE.GeometryUtils.merge(last_geometry, tube);
            this.staticTail.push(new THREE.Mesh(last_geometry.clone(), material));
        }
    } else { //2D trail
        var vertices = [];
        for (var i = 0; i <= this.last_alive; i++) {
            var vertex = data.rounds[i].bikes[this.id].vertex;
            vertices.push( board.vertices[vertex] );
            vertices.push( board.vertices[vertex].plusNormal(0.05) );
            var geometry = new THREE.Geometry();
            geometry.vertices = vertices.slice(0); //Will actually clone the array
            for (var j = 0; j < geometry.vertices.length-3; j++) {
                geometry.faces.push(new THREE.Face3(j+0,j+1,j+2));
                geometry.faces.push(new THREE.Face3(j+0,j+2,j+1));
                geometry.faces.push(new THREE.Face3(j+1,j+2,j+3));
                geometry.faces.push(new THREE.Face3(j+1,j+3,j+2));
            }
            geometry.verticesNeedUpdate = true;
            geometry.computeCentroids();
            this.staticTail.push(new THREE.Mesh(geometry, material));
        }
    }
    //TODO: 3D tail
/*
    extrudePath = [];
    for (var i = 0; i <= this.last_alive; i++) {
        var vertex = data.rounds[i].bikes[this.id].vertex;
         extrudePath.push(board.vertices[ vertex ]);
    }
    //var extrudeSpline = new THREE.SplineCurve3(extrudePath);
    var extrudeSpline = new THREE.Path(extrudePath);
*/
    //tube = new THREE.TubeGeometry(extrudeSpline, extrudePath.length, 0.033, 8, false);

/*
    var frames = new THREE.TubeGeometry.FrenetFrames(extrudePath, extrudePath.length, false);
    for (var i in frames.normals) {
        frames.binormals[i] = extrudePath[i].normal;
    }
*/
/*
    var circleRadius = 0.033;
    var circleShape = new THREE.Shape();

            circleShape.moveTo( 0, circleRadius );
            circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
            circleShape.quadraticCurveTo( circleRadius, -circleRadius, 0, -circleRadius );
            circleShape.quadraticCurveTo( -circleRadius, -circleRadius, -circleRadius, 0 );
            circleShape.quadraticCurveTo( -circleRadius, circleRadius, 0, circleRadius);
    */
/*
    circleShape.moveTo( -0.02, 0 );
    circleShape.quadraticCurveTo( 0, 0.1, 0, 0.1 );
    circleShape.quadraticCurveTo( 0.02, 0, 0, 0.02 );
    */
    /*
    var extrudeSettings = { amount: extrudePath.length, bevelEnabled: true, steps: extrudePath.length, extrudePath: extrudeSpline };
    tube = circleShape.extrude(extrudeSettings);

    scene.add( new THREE.Mesh(tube, new THREE.MeshLambertMaterial({ color:  0xff00ff })));
*/

//     cylinder = new THREE.CylinderGeometry(0.1,0.1, 0.3, 5, 1, false);

    this.update();

}

function createWall(vertex, next_vertex) {
    //TODO: Fer algo maco aqui
    var mesh = new THREE.CubeGeometry(0.1, 0.1, 0.1);
    var matrix = new THREE.Matrix4();
    matrix.translate(next_vertex);
    mesh.applyMatrix(matrix);
    return mesh;
}

Bike.prototype.animate = function(delta_time) {
    if (this.bonusIndicator) this.bonusIndicator.animate(delta_time);
}

Bike.prototype.update = function() {
	
	//Kind of delta time
    var lerp_fraction = (next_update - last_update) / time_per_round;
	
    var round = data.rounds[actRound].bikes[this.id];

    var isAlive = (actRound <= this.last_alive || (lerp_fraction > 0.9 && actRound == this.last_alive+1)); //Written this way to display the moment of the crash
	
	if (isAlive != this.was_alive) {
        this.was_alive = isAlive;
        if (isAlive) {
            scene.add(this.mesh);
            scene.add(this.dynamicTail_mesh);
            scene.add(this.staticTail[actRound]);
        } else {
			if (!gamePaused) {
				sfx_crash.currentTime = 0;
				sfx_crash.play();
            }
			scene.remove(this.mesh);
            scene.remove(this.dynamicTail_mesh);
            scene.remove(this.staticTail[this.round]);
        }
    }

    if (!isAlive) return;

     if (actRound % 2 && round.turbo_duration <= 0 && !this.was_turbo) {
        round = data.rounds[actRound-1].bikes[this.id];
    }

    this.from = board.vertices[round.vertex];
    this.to = board.vertices[round.next_vertex];

    if (lerp_fraction > 1) lerp_fraction = 1;
    else if (lerp_fraction < 0) lerp_fraction = 0;
    if (round.turbo_duration <= 0) {
        lerp_fraction /= 2;
        if (!(actRound % 2)) lerp_fraction += 0.5;

    }

    //Set orientation

	this.mesh.position = this.from;
	this.mesh.up = this.from.normal;
	if (this.to != this.from) {
		this.mesh.lookAt(this.to);
    } /*else if (actRound != data.nb_rounds){
		var other = this.from.neighbours[0];
		this.mesh.lookAt(board.vertices[other]);
	}*/

    //Set position
    this.mesh.position = lerp(this.from, this.to, lerp_fraction);
    this.mesh.position = this.mesh.position.plusNormal(0.05);

    if (this.to != this.from) {
        this.mesh.rotateX(-0.15);
    }

    //Update dynamic tail
    this.dynamicTail.vertices[0].copy(this.from);
    this.dynamicTail.vertices[1].copy(this.from.plusNormal(0.05));
    this.dynamicTail.vertices[2].copy(lerp(this.from, this.to, lerp_fraction));
    this.dynamicTail.vertices[3].copy(lerp(this.from, this.to, lerp_fraction).plusNormal(0.05));
    this.dynamicTail.verticesNeedUpdate = true;
    this.dynamicTail.computeCentroids();

    //Update static tail
    if (this.round != actRound) {
        scene.remove(this.staticTail[this.round]);
        scene.add(this.staticTail[actRound]);
        this.round = actRound;
    }

    //Bonus item in inventory indicator
    var is_withitem = (round.bonus != 'n');
    if (is_withitem && round.bonus != this.last_item) { //Case when we have an item and pick up a new one
        if (this.bonusIndicator) {
            this.bonusIndicator.remove();
            this.bonusIndicator = null;
        }
        this.was_withitem = false;
        this.last_item = null;
    }
    if  (is_withitem != this.was_withitem) {
        if (is_withitem) {
            this.bonusIndicator = new BonusIndicator(this, round.bonus);
            this.last_item = round.bonus;
        } else {
            this.bonusIndicator.remove();
            this.bonusIndicator = null;
            this.last_item = null;
        }
        this.was_withitem = is_withitem;
    }
    if (this.bonusIndicator) this.bonusIndicator.update();

    //Ghost mode effect
    var is_ghost = (round.ghost_duration > 0);
    if (is_ghost != this.was_ghost) {
        this.material.opacity = is_ghost? 0.4 : 1;
        this.material.transparent = is_ghost;
        this.material.needsUpdate = true;
        this.was_ghost = is_ghost;
    }

    //Turbo mode effect
    var is_turbo = (round.turbo_duration > 0);
    if (is_turbo != this.was_turbo) {
        var scale = is_turbo? 1.5 : 1;
        this.mesh.scale.set(scale,scale,scale);
        this.was_turbo = is_turbo;
    }

}


// BONUS CLASS
// ===========

function Bonus (vertex, type, duration) {

    this.vertex = vertex;
    this.type = type;
    this.duration = duration;

    this.visible = false;

    this.mesh = new THREE.Mesh(
        new THREE.CubeGeometry(0.1,0.1,0.1),
        new THREE.MeshBasicMaterial( { map: bonus_textures[type] } )
    );

    this.mesh.position = vertex.plusNormal(0.07);
    this.mesh.lookAt(vertex.plusNormal(1));

}

Bonus.prototype.animate = function(delta_time) {

    this.mesh.rotateZ( 0.002 * delta_time);

}

Bonus.prototype.update = function() {

    var should_be_visible = (actRound >= data.bonus_round && actRound < this.duration);
    if (this.visible != should_be_visible) {
        if (this.visible) {
			if (!gamePaused) {
				sfx_bonus.currentTime = 0;
				sfx_bonus.play();
			}
            scene.remove(this.mesh);
        } else {
            scene.add(this.mesh);
        }
        this.visible = should_be_visible;
    }

}

// BONUSINDICATOR CLASS
// ====================

function BonusIndicator (bike, type) {

    this.bike = bike;
    this.type = type;
    this.mesh = new THREE.Mesh(
        new THREE.CubeGeometry(0.03,0.03,0.03),
        new THREE.MeshBasicMaterial( { map: bonus_textures[type] } )
    );
    scene.add(this.mesh);

}

BonusIndicator.prototype.remove = function() {
    scene.remove(this.mesh);
}

BonusIndicator.prototype.animate = function(delta_time) {

}

BonusIndicator.prototype.update = function() {

    var vertex = this.bike.mesh.position;
    this.mesh.position = vertex.plusNormal(0.1);
    this.mesh.lookAt(vertex.plusNormal(1));

}


/*
// OBSTACLE CLASS
// ==============

function Obstacle (vertex) {

    this.mesh = new THREE.Mesh(
        obstacle_geometry,
        new THREE.MeshBasicMaterial( { color: 0x993333 } )
    );

    this.mesh.scale = new THREE.Vector3(0.5,0.5,0.5);

    this.mesh.position = vertex.clone();
    this.mesh.lookAt(vertex.plusNormal(1));

    scene.add(this.mesh);

}
*/


// *********************************************************************
// Initialization functions
// *********************************************************************

function parseData (raw_data_str) {

    if ("" == raw_data_str) {
        alert("Could not load game file");
        return false;
    }

    function parse_assert(read_value, expected_value) {
        var correct = (read_value == expected_value);
        if (!correct) {
			alert("Error parsing file, expected token: " + expected_value + ", read token: " + read_value);
			throw "parse exception"; //This way the debugger will pause execution automatically on the offending expression
        }
		return correct;
    }

    // convert text to tokens
    var st = raw_data_str + "";
    var t = st.replace('\n', ' ').split(/\s+/);
    var p = 0;

    // read prelude

    //game and version
    if (t[p++] != "tron3d") {
        alert("Are you sure this is a Tron3D game file?");
        document.getElementById('file').value = "";
        document.getElementById('inputdiv').style.display = "";
        document.getElementById('loadingdiv').style.display = "none";
        return false;
    }
    data.version = t[p++];
    if (data.version != "v1.0") {
        alert("Unsupported game version! Trying to load it anyway.");
    }

    if (!parse_assert(t[p++], "map")) return false;
    data.map = t[p++];

    if (!parse_assert(t[p++], "nb_players")) return false;
    data.nb_players = int(t[p++]);

    parse_assert(t[p++], "nb_bikes");
    data.nb_bikes = int(t[p++]);

    parse_assert(t[p++], "nb_rounds");
    data.nb_rounds = int(t[p++]);

    parse_assert(t[p++], "bonus_round");
    data.bonus_round = int(t[p++]);

    parse_assert(t[p++], "turbo_duration");
    data.turbo_duration = int(t[p++]);

    parse_assert(t[p++], "ghost_duration");
    data.ghost_duration = int(t[p++]);

    parse_assert(t[p++], "score_bonus");
    data.score_bonus = int(t[p++]);

    parse_assert(t[p++], "secgame");
    data.secgame = (t[p++] == "true");

    parse_assert(t[p++], "names");
    data.names = new Array();
    for (var i = 0; i < data.nb_players; ++i) {
        data.names[i] = t[p++];
    }

    var endRound = -1;
    data.rounds = new Array();
    for (var round = 0; round <= data.nb_rounds; ++round) {

        parse_assert(t[p++], "round");
        if (int(t[p++]) != round) alert("Wrong round number!");

        data.rounds[round] = { };

        // score
        parse_assert(t[p++], "score");
        data.rounds[round].score = new Array();
        for (var i = 0; i < data.nb_players; ++i) {
            data.rounds[round].score[i] = int(t[p++]);
        }

        // status
        parse_assert(t[p++], "status");
        data.rounds[round].cpu = new Array();
        for (var i = 0; i < data.nb_players; ++i) {
            var cpu = int(double(t[p++])*100);
            data.rounds[round].cpu[i] = (cpu == -100)? "out" : cpu+"%";
        }

        // vertices
        //Actually we don't need to store each vertex, we only want to know
        //about the bonuses (that are read below), skipping this part
        var vertices_str = t[p++];
        var vertices = vertices_str.split('');
        /*
        data.rounds[round].vertices = [ ];
        for (var i in vertices) {
            var v = vertices[i];
            if (v >= '0' && v <= '9') {
                data.rounds[round].vertices.push({
                    wall: int(v),
                    bonus: 'n'
                });
            } else {
                data.rounds[round].vertices.push({
                    wall: -1,
                    bonus: v
                });
            }
        }
        */

        // bonuses
        if (round == data.bonus_round) {
            data.bonus_vertices = {};
            for (var i in vertices) {
                var v = vertices[i];
                if (v == 'p' || v == 'g' || v == 't') {
                    data.bonus_vertices[i] = {
                        type: v,
                        duration: data.bonus_round+1
                    }
                }
            }
        } else if (round > data.bonus_round) {
            for (var i in vertices) {
                var v = vertices[i];
                if (v == 'p' || v == 'g' || v == 't') {
                    data.bonus_vertices[i].duration++;
                }
            }
        }

        // bikes
        var someone_alive = false;
        data.rounds[round].bikes = [ ];
        for (var i = 0; i < data.nb_bikes * data.nb_players; ++i) {
            var bike = {
                player: int(t[p++]),
                bonus:  t[p++],
                vertex: int(t[p++]),
                turbo_duration: int(t[p++]),
                ghost_duration: int(t[p++]),
                alive: (t[p++] == '1'),
                next_vertex: -1, //Will be read later
                uses_bonus: false //Will be read later
            };
            if (typeof(bike.bonus) === 'undefined') {
                alert("Error parsing file, expected a bike description. Are you sure this is a game output and not a game definition?");
                return false;
            }
            if (bike.alive) someone_alive = true;
            bike.next_vertex = bike.vertex;
            data.rounds[round].bikes.push(bike);
        }


        if (round != data.nb_rounds) {

			// actions
			parse_assert(t[p++], "actions");
			for (var i = 0; i < data.nb_players; i++) {
				while(int(t[p++]) != -1); //Skip actions (they end with a -1)
			}

			// movements
			parse_assert(t[p++], "movements");
			var bike = int(t[p++]);
			while (bike != -1) {
				data.rounds[round].bikes[bike].next_vertex = int(t[p++]);
				data.rounds[round].bikes[bike].uses_bonus = (t[p++] == '1');
				bike = int(t[p++]);
			}

		}

        //Do not display more rounds after all the bikes are dead
        if (!someone_alive && endRound == -1) {
            if (round < 10) { //If all bikes are dead the first rounds, do not limit the duration
                endRound = data.nb_rounds;
            } else {
                if (round%2) endRound = round+1;
                else endRound = round+2;
                if (endRound > data.nb_rounds) endRound = data.nb_rounds;
            }
        }
    }

    if (endRound != -1) {
        data.nb_rounds = endRound;
    }

    return true;

}


//Initializing the game
function initGame (raw_data) {

    document.getElementById("loadingdiv").style.display="";

    if (parseData(raw_data) === false) return;

    if (!ascii) {
        document.body.className = "game_background";
    }

    // prepare state variables
    /*if (getURLParameter("start") == "yes") gamePaused = false;
    else gamePaused = true;*/
    gamePaused = false;
    gamePreview = false;

    // slider init
    $("#slider").width(500);
    $("#slider").slider({
        min: -1, //HACK: This should be 0. The slider bugs when dragging it with the mouse and this fixes it.
        max: data.nb_rounds+1, //HACK: As before, this should be data.nb_rounds, we need extra margin in both sides.
        slide: sliderChanged
    });

    // set the listerners for interaction
    document.addEventListener('keyup', onKeyPressed, false);

    document.getElementById("loadingdiv").style.display="none";
    document.getElementById("gamediv").style.display="";


    initScene();
	
	if (!mute) {
		bgm.play();
	}

    next_update = Date.now() + readysteadygo_time;
    mainLoop();
}



function initScene () {

    // Canvas and renderer

    var width = window.innerWidth;
    var height = window.innerHeight;

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    if (usingWebGl) {
        try {
            renderer = new THREE.WebGLRenderer();
        } catch(e) {
            alert("Warning: Support for WebGL not present.\nLoading low-quality version.");
            usingWebGl = false;
        }
    }
    if (!usingWebGl) {
        renderer = new THREE.CanvasRenderer();
    }

    renderer.setSize( width, height );

    if (ascii) {
        effect = new THREE.AsciiEffect( renderer );
        effect.setSize( width, height );
        container.appendChild( effect.domElement );
    } else {
        container.appendChild( renderer.domElement );
    }

    // FPS counter

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    // Camera and camera controls

    camera = new THREE.PerspectiveCamera( 50, width / height, 0.05, 100 );
    camera.position.y = -1;
    camera.position.z = 2.5;

    controls = new THREE.TrackballControls( camera, (effect? document : renderer.domElement) );
    controls.noPan = true;

    // Scene object

    scene = new THREE.Scene();

    // Lights

    if (usingWebGl) {
        var ambient = new THREE.AmbientLight( 0x992233 );
        scene.add( ambient );

        pointLight = new THREE.PointLight( 0xdddddd );
        scene.add( pointLight );
    }

    // Load json models

    var loader = new THREE.JSONLoader();
    obstacle_geometry = loader.parse(obstacle_json).geometry;
    if (usingWebGl) {
        bike_geometry = loader.parse(bike_json).geometry;
    } else {
        bike_geometry = new THREE.CubeGeometry( 0.04, 0.1, 0.2 );
    }

    // Create geometry of our board

    switch(data.map) {
        case "icosahedron": //procedurally generated
            var loop_subdivisions = 2;
            board = new THREE.IcosahedronGeometry(1, loop_subdivisions);
            break;
        case "plane": //procedurally generated
            var divisions = 12;
            board = new THREE.PlaneGeometry(2,2,divisions,divisions);
            break;
        case "cube": //loaded from json model
            board = loader.parse(cube_json).geometry;
            board.applyMatrix(new THREE.Matrix4().scale({x: 0.75, y: 0.75, z: 0.75}));
            board.computeVertexNormals();
            break;
    }

    // Instantiate board 3D object

    var solidMaterial = new THREE.MeshBasicMaterial({ color:0x222255, opacity: map_transparency, transparent: true });
    var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x6666AA, wireframe: true, transparent: true } );
    var multiMaterial = [ solidMaterial, wireframeMaterial ];
    var board_object = new THREE.SceneUtils.createMultiMaterialObject(board, multiMaterial);
    board_object.children[ 1 ].scale.multiplyScalar(1.001);
    if (data.map == "plane") board_object.children[1].position.z+=0.001; //HACK
    scene.add( board_object );

    // Find neighbours of each vertex in the board

    for (var i in board.vertices) {
        board.vertices[i].neighbours = [];
    }
    for (var i in board.faces) {
        var f = board.faces[i];
        if (f.d) { //Quads
            board.vertices[f.a].neighbours.push(f.b,f.d);
            board.vertices[f.b].neighbours.push(f.a,f.c);
            board.vertices[f.c].neighbours.push(f.b,f.d);
            board.vertices[f.d].neighbours.push(f.a,f.c);
        } else { //Triangles
            board.vertices[f.a].neighbours.push(f.b,f.c);
            board.vertices[f.b].neighbours.push(f.a,f.c);
            board.vertices[f.c].neighbours.push(f.a,f.b);
        }
    }
    for (var i in board.vertices) {
        var vertex = board.vertices[i];
        vertex.neighbours = sort_unique(vertex.neighbours);
        if (print_adjacency_matrix) {
            console.log(vertex.neighbours);
        }
    }

    //Copy normals from faces to vertices (ThreeJS stores them in faces)

    if (data.map == "plane") { //Let's optimize the plane case and just set them all to UnitZ
        for (var i in board.vertices) {
            board.vertices[i].normal = THREE.Vector3.UnitZ;
        }
    } else {
        var aux_normals = [];
        for (var i in board.vertices) {
            aux_normals.push([]);
        }
        for (var i in board.faces) {
            var f = board.faces[i];
            aux_normals[f.a].push(f.vertexNormals[0]);
            aux_normals[f.b].push(f.vertexNormals[1]);
            aux_normals[f.c].push(f.vertexNormals[2]);
            if (f.d) aux_normals[f.d].push(f.vertexNormals[3]);
        }
        for (var i in board.vertices) {
            var neighbours = board.vertices[i].neighbours;
            board.vertices[i].neighbours = neighbours.filter(function(elem, pos) {
                return neighbours.indexOf(elem) == pos;
            });
            var normals = aux_normals[i];
            var normal = new THREE.Vector3();
            for (var n in normals) {
                normal.x += normals[n].x;
                normal.y += normals[n].y;
                normal.z += normals[n].z;
            }
            normal.x /= normals.length;
            normal.y /= normals.length;
            normal.z /= normals.length;
            board.vertices[i].normal = normal;
        }
    }

    /*
    //Add random obstacles
    for (var i in board.vertices) {
        if (Math.random() < obstacle_chance) {
            board.vertices[i].obstacle = new Obstacle(board.vertices[i]);
        } else {
            board.vertices[i].obstacle = 0;
        }
    }
    */

    // Instantiate Bikes

    for (var i = 0; i < (data.nb_players * data.nb_bikes); i++) {
        bikes.push(new Bike(i));
    }

    // Instantiate Bonuses

    for (var i in data.bonus_vertices) {
        var vertex = board.vertices[i];
        var info = data.bonus_vertices[i];
        bonus.push(new Bonus(vertex, info.type, info.duration));
    }

    // Event listeners

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();

    //spawn points for icosahedron
    /*
    default_line_color = 0x0000ff;
    a(0);
    a(1);
    a(5);
    a(26);
    a(30);
    new Obstacle(board.vertices[26]);
    new Obstacle(board.vertices[30]);
    new Obstacle(board.vertices[5]);
    default_line_color = 0xff0000;
    a(3);
    a(9);
    a(8);
    a(142);
    a(145);
    new Obstacle(board.vertices[142]);
    new Obstacle(board.vertices[145]);
    new Obstacle(board.vertices[8]);
    default_line_color = 0x00ff00;
    a(11);
    a(2);
    a(4);
    a(151);
    a(152);
    new Obstacle(board.vertices[151]);
    new Obstacle(board.vertices[152]);
    new Obstacle(board.vertices[2]);
    default_line_color = 0xffff00;
    a(6);
    a(7);
    a(10);
    a(87);
    a(90);
    new Obstacle(board.vertices[87]);
    new Obstacle(board.vertices[90]);
    new Obstacle(board.vertices[10]);
    */
    //spawn points for cube
    /*
    default_line_color = 0x0000ff;
    e(83);
    e(84);
    default_line_color = 0xff0000;
    e(137);
    e(138);
    default_line_color = 0x00ff00;
    e(65);
    e(68);
    default_line_color = 0xffff00;
    e(146)
    e(149);
    //bonus
    default_line_color = 0xffffff;
    e(172)
    e(190);
    e(181);
    e(217);
    e(199);
    e(208);
    */
}



// *********************************************************************
// Main loop functions
// *********************************************************************

function updateGame() {

    for(var b in bikes) {
        bikes[b].update();
    }

    for(var b in bonus) {
        bonus[b].update();
    }

}

function updateAnimation(delta_time) {

    for(var b in bikes) {
        bikes[b].animate(delta_time);
    }

    for(var b in bonus) {
        bonus[b].animate(delta_time);
    }

}

var debugVertexOrder = false;
var debugVertexOrderIndex = 0;
function roundChanged() {
    if (actRound < 0) actRound = 0;
    if (actRound >= data.nb_rounds) {
        actRound = data.nb_rounds;
        gamePaused = true;
        setTimeout(fadeOut, 10);
    }
    $("#slider").slider("value", actRound);


    if (debugVertexOrder) {
        e(debugVertexOrderIndex++);
    }
}


function fadeOut () {
    bgm.volume *= 0.95;
    if (bgm.volume < 0.001) {
		bgm.pause();
	} else {
		setTimeout(fadeOut, 10);
	}
}



function mainLoop() {

    var current_time = Date.now();
    var delta_time = current_time - last_time;
    last_time = current_time;

    controls.update();
    if (pointLight) pointLight.position = camera.position;

    // Configure buttons
    if (gamePaused) {
        $("#but_play").show();
        $("#but_pause").hide();
    } else {
        $("#but_play").hide();
        $("#but_pause").show();
    }

    if (!gamePaused || gamePreview) {

        last_update = current_time;

        if (gamePreview) {
            next_update = current_time + time_per_round;
            gamePreview = false;
        } else {
            if (current_time >= next_update) {
                actRound++;
                next_update = current_time + time_per_round;
                roundChanged();
            }
        }

        updateGame();
        writeGameState();

        if (!gamePaused) {
            updateAnimation(delta_time);
        }

    }

    if (effect) effect.render( scene, camera );
    else renderer.render( scene, camera );
    stats.update();

    requestAnimationFrame( mainLoop );
    //setTimeout(mainLoop, 1000/60);
}


function writeGameState () {
    //write round number
    document.getElementById("round_number").innerHTML = "Round: " + actRound;

    //update scoreboard
    var scoreboard = "";
    for (var i = 0; i < data.nb_players; i++) {
        scoreboard += "<span class='score'>"
            + "<div style='display:inline-block; margin-top: 5px; width:20px; height:20px; background-color:"+ player_colors[i] +"'></div>"
            + "<div style='display:inline-block; vertical-align: middle; margin-bottom: 7px; margin-left:8px;'>"+data.names[i]+"</div>"
            + "<br/>"
            + "<div style='margin-left: 10px;'>"
                + "<div style='padding:2px;'>Score: "+data.rounds[actRound].score[i]+"</div>"
                + (data.secgame? "<div style='padding:2px;'>CPU: " + data.rounds[actRound].cpu[i] + "</div>" : "")
            + "</div>"
        + "</span><br/><br/>";
    }
    document.getElementById("scores").innerHTML = scoreboard;
}


// *********************************************************************
// Button events
// *********************************************************************

function playButton () {
    if (actRound >= data.nb_rounds - 1) actRound = 0;
    roundChanged();
    gamePaused = false;
    next_update = Date.now() + time_per_round;
}

function pauseButton () {
    gamePaused = true;
    gamePreview = true; //To call render again
    roundChanged();
}

function startButton () {
    actRound = 0;
    roundChanged();
    gamePreview = true;
    gamePaused = true;
}

function endButton () {
    actRound = data.nb_rounds;
    roundChanged();
    gamePreview = true;
}




// *********************************************************************
// Keyboard and Mouse events
// *********************************************************************

function onKeyPressed (event) {

    // http://www.webonweboff.com/tips/js/event_key_codes.aspx

    switch (event.keyCode) {

        case 36: // Start
            actRound = 0;
            roundChanged();
            gamePreview = true;
            break;

        case 35: // End
            actRound = data.nb_rounds;
            roundChanged();
            gamePreview = true;
            break;

        case 33: // PageDown
            actRound -= 10;
            roundChanged();
            gamePreview = true;
            break;

        case 34: // PageUp
            actRound += 10;
            roundChanged();
            gamePreview = true;
            break;

        case 38: // ArrowUp
        case 37: // ArrowLeft
            gamePaused= true;
            --actRound;
            roundChanged();
            gamePreview = true;
            break;

        case 40: // ArrowDown
        case 39: // ArrowRight
            gamePaused = true;
            ++actRound;
            roundChanged();
            gamePreview = true;
            break;

        case 32: // Space
            if (gamePaused) playButton();
            else pauseButton();
            break;

        case 72: // "h"
            help();
            break;

        default:
            //$("#debug").html(event.keyCode);
            break;
    }
}

function sliderChanged(event, ui) {
    gamePaused = true;
    gamePreview = true;
    actRound = $("#slider").slider( "value" );
    roundChanged();
}

function help () {
    // opens a new popup with the help page
    var win = window.open('help.html' , 'name', 'height=400, width=300');
    if (window.focus) win.focus();
    return false;
}



// *********************************************************************
// Main function, it is called when the document is ready.
// *********************************************************************

function init () {

    // get url parameters
    var game;
    if (getURLParameter("sub") != null) {
		var domain = window.location.protocol + "//" + window.location.host;
        if (getURLParameter("nbr") != null) {
            game = domain + "/?cmd=lliuraments&sub="+getURLParameter("sub")+"&nbr="+getURLParameter("nbr")+"&download=partida";
        } else {
            game = domain + "/?cmd=partida&sub="+getURLParameter("sub")+"&download=partida";
        }
    } else {
        game = getURLParameter("game");
    }

    if (game == null || game == "") {
        // ask the user for a game input
        var inputdiv = document.getElementById('inputdiv')
        inputdiv.style.display = "";
        document.getElementById('file').addEventListener('change', function(evt) {
            //http://www.html5rocks.com/en/tutorials/file/dndfiles/
            var file = evt.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onloadend = function(evt) {
                if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                    inputdiv.style.display = "none";
                    document.getElementById("loadingdiv").style.display="";
                    initGame(reader.result);
                } else {
                    alert("Error accessing file");
                }
            };
        }, false);
    } else {
        document.getElementById("loadingdiv").style.display="";
        // load the given game
        loadFile(game, initGame);
    }

}




