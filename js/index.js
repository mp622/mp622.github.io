/**
 * Web RTTEX to PNG Converter
 * (c) 2017 - 2018 cernodile.com
 * Special thanks to healLV teaching me about hex operations
 * Usage of this script outside cernodile.com and it's subdomains is strictly prohibited unless otherwise told.
 * Contributions are welcome
 */
var filename;
var c;
var ctx;
var cont;
var rt_toggle = false;
var rt_disable_img_render = false;
var filename;
var c;
var ctx;
var cont;
function finput () {
    // Add click handler instead of the default monstorious one.
    document.getElementById("fileinput").click();
}
document.addEventListener("DOMContentLoaded", function () {
    try {
        document.getElementById("fileinput").addEventListener('change', readSingleFile, false);
        c = document.getElementById("canvas");
        ctx = c.getContext("2d");
        cont = document.getElementById("result");
    } catch (e) {
        // For whatever reason it doesn't want to load DOM yet..
        setTimeout(function() {
            document.getElementById("fileinput").addEventListener('change', readSingleFile, false);
            c = document.getElementById("canvas");
            ctx = c.getContext("2d");
            cont = document.getElementById("result");
        }, 500);
    }
}, false);

function readSingleFile(evt) {
    // Clear canvas
    ctx.clearRect(0, 0, c.width, c.height);
    c.width = 0;
    c.height = 0;
    cont.style.width = 0;
    cont.style.height = 0;
    // Handle singular file only
    var f = evt.target.files[0];
    var reader = new FileReader();
	var rt_toggle = document.getElementById("rt_toggle").checked;
	var size = evt.target.files[0].size;
	if (rt_toggle)
		reader.readAsDataURL(f);
	else reader.readAsArrayBuffer(f); // Read as array buffer, so we can convert it to Uint8Array, using it as a string would be a really bad idea.
    reader.onloadend = function(evt) {
		if (rt_toggle)
			imageconvert(evt.target.result, f.name, size);
		else convert(new Uint8Array(evt.target.result), f.name);
    }
}

function imageconvert(result, name, size) {
	// Simulate pvrt8888 file
	var img = new Image();
	img.onload = function () {
		// BENCHMARK -- IMAGE TO RTTEX
		var benchIR = Date.now();
		var width = img.width;
		var height = img.height;
		var packedW = 0;
		var packedH = 0;
		var pwArray = [];
		var phArray = [];
		for (var j = 4; j < 32; j++) {
			if (packedW == 0 || packedH == 0) {
				if (Math.pow(2, j) >= width && packedW == 0) packedW = Math.pow(2, j);
				if (Math.pow(2, j) >= height && packedH == 0) packedH = Math.pow(2, j);
			} else break;
		}
		var data = [];
		for (var j = 0; j < (0x7C + (packedW * packedH * 4) - 5); j++) {
			if (j == 0) {
				data.push("R".charCodeAt(0));
				data.push("T".charCodeAt(0));
				data.push("T".charCodeAt(0));
				data.push("X".charCodeAt(0));
				data.push("T".charCodeAt(0));
				data.push("R".charCodeAt(0));
			} else {
				data.push(0);
			}
		}
		data[0x10] = 1;
		data[0x11] = 20;
		data[0x1C] = 1; // Alpha
		data[0x20] = 1; // 1 mipmap
		var data = new Uint8Array(data);
		var hArray = [];
		var hexHeight = height.toString(16).split("").reverse().join("").match(/.{1,2}/g);
		for (var j in hexHeight) {
			if (hexHeight[j].length % 2 == 0) {
				hArray.push(hexHeight[j].split("").reverse().join(""));
			} else {
				hArray.push("0" + hexHeight[j]);
			}
		}
		var wArray = [];
		var hexWidth = width.toString(16).split("").reverse().join("").match(/.{1,2}/g);
		for (var j in hexWidth) {
			if (hexWidth[j].length % 2 == 0) {
				wArray.push(hexWidth[j].split("").reverse().join(""));
			} else {
				wArray.push("0" + hexWidth[j]);
			}
		}
		for (var j = 0; j < 4; j++) {
			if (wArray[j]) {
				data[0x18 + j] = parseInt(wArray[j], 16);
				data[0x68 + j] = parseInt(wArray[j], 16);
			} else {
				data[0x18 + j] = 0;
				data[0x68 + j] = 0;
			}
		}
		for (var j2 = 0; j2 < 4; j2++) {
			if (hArray[j2]) {
				data[0x14 + j2] = parseInt(hArray[j2], 16);
				data[0x64 + j2] = parseInt(hArray[j2], 16);
			} else {
				data[0x14 + j2] = 0;
				data[0x64 + j2] = 0;
			}
		}
		var dArray = [];
		var dSize = (width * height * 4).toString(16).split("").reverse().join("").match(/.{1,2}/g);
		for (var j in dSize) {
			if (dSize[j].length % 2 == 0) {
				dArray.push(dSize[j].split("").reverse().join(""));
			} else {
				dArray.push("0" + dSize[j]);
			}
		}
		for (var j2 = 0; j2 < 4; j2++) {
			if (dArray[j2]) {
				data[0x6C + j2] = parseInt(dArray[j2], 16);
			} else {
				data[0x6C + j2] = 0;
			}
		}
		var hexpw = packedW.toString(16).split("").reverse().join("").match(/.{1,2}/g);
		for (var j in hexpw) {
			if (hexpw[j].length % 2 == 0) {
				pwArray.push(hexpw[j].split("").reverse().join(""));
			} else {
				pwArray.push("0" + hexpw[j]);
			}
		}
		var hexph = packedH.toString(16).split("").reverse().join("").match(/.{1,2}/g);
		for (var j in hexph) {
			if (hexph[j].length % 2 == 0) {
				phArray.push(hexph[j].split("").reverse().join(""));
			} else {
				phArray.push("0" + hexph[j]);
			}
		}
		for (var j = 0; j < 4; j++) {
			if (pwArray[j]) {
				data[0x0C + j] = parseInt(pwArray[j], 16);
			} else data[0x0C + j] = 0;
		}
		for (var j2 = 0; j2 < 4; j2++) {
			if (phArray[j2]) {
				data[0x08 + j2] = parseInt(phArray[j2], 16);
			} else data[0x08 + j2] = 0;
		}
		// Set canvas dimensions 
		var offC = document.createElement('canvas');
		offC.width = width;
		offC.height = height;
		var offCtx = offC.getContext("2d");
		// Draw canvas
		offCtx.drawImage(img, 0, 0);
		// Start pointing at the bitmap data, we don't need any other data
		y = packedH - 1;
		x = 0;
		var iData = offCtx.getImageData(0, height - 1, width, 1);
		for (var pointer = 0x7C; pointer < (0x7C + (packedW * packedH * 4)); pointer+=4) {
			if (x >= width) {
				if (x >= packedW) {
					x = 0;
					y--;
					iData = offCtx.getImageData(0, y, width, 1);
					if (iData.data.slice(x * 4, (x * 4) + 4).toString() == "0,0,0,0") {
						data[pointer] = 255;
						data[pointer+1] = 255;
						data[pointer+2] = 255;
					} else {
						for (var d = 0; d < 4; d++) {
							data[pointer + d] = iData.data[(x * 4) + d];
						}
					}
				x++;
				} else {
					for (var d = 0; d < 4; d++) {
						if (d == 3) data[pointer + d] = 0;
						else data[pointer + d] = 255;
					}
					x++;
					if (x >= packedW) {
						x = 0;
						y--;
						iData = offCtx.getImageData(0, y, width, 1);
					}
				}
			} else {
				if (iData.data.slice(x * 4, (x * 4) + 4).toString() == "0,0,0,0") {
					data[pointer] = 255;
					data[pointer+1] = 255;
					data[pointer+2] = 255;
				} else {
					for (var d = 0; d < 4; d++) {
						data[pointer + d] = iData.data[(x * 4) + d];
					}
				}
				x++;
			}
			if (pointer >= (0x7C + (packedW * packedH * 4) - 4)) {
				// Clear from memory.
				offC.remove();
				// CONCLUDE BENCHMARK -- IMAGE TO RTTEX
				console.log("[BENCHMARK] Backend IMAGE to RTTEX pre-compression/save OG: " + width + "x" + height + " POW: " + packedW + "x" + packedH + " concluded with " + (Date.now() - benchIR) + "ms.");
				finishedGen(pako.deflate(data), (packedW * packedH * 4) - 4);
				convert(data, name);
				break;
			}
		}
	};
	filename = name;
	img.src = result;
}
function rtpackheader (r, og) {
	var data = new Uint8Array([82,84,80,65,67,75,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	var d = r.length.toString(16).split("").reverse().join("").match(/.{1,2}/g);
	var cmp = []
	for (var j in d) {
		if (d[j].length % 2 == 0) {
			cmp.push(d[j].split("").reverse().join(""));
		} else {
			cmp.push("0" + d[j]);
		}
	}
	for (var j2 = 0; j2 < 4; j2++) {
		if (cmp[j2]) {
			data[0x08 + j2] = parseInt(cmp[j2], 16);
		} else data[0x08 + j2] = 0;
	}
	var d = og.toString(16).split("").reverse().join("").match(/.{1,2}/g);
	var cmp = []
	for (var j in d) {
		if (d[j].length % 2 == 0) {
			cmp.push(d[j].split("").reverse().join(""));
		} else {
			cmp.push("0" + d[j]);
		}
	}
	for (var j2 = 0; j2 < 4; j2++) {
		if (cmp[j2]) {
			data[0x0C + j2] = parseInt(cmp[j2], 16);
		} else data[0x0C + j2] = 0;
	}
	return data.buffer;
}
function finishedGen (r, og) {
	var blob = new Blob([rtpackheader(r,og), r.buffer], {
		type: "application/octet-stream"
	});
	var url = window.URL.createObjectURL(blob);
	var a;
	a = document.createElement('a');
	a.href = url;
	a.download = filename.split(".")[0] + ".rttex";
	document.body.appendChild(a);
	a.style = 'display: none';
	a.click();
	a.remove();
	setTimeout(function() {
		return window.URL.revokeObjectURL(url);
	}, 2500);
}
function convert(result, name) {
	// BENCHMARK -- RTTEX TO PNG
	var benchRP = Date.now();
    // Shorten it to reduce file length
    var ch = String.fromCharCode;
    // Are we using pako? This depends on the file header
    var pk = false;
    if (ch(result[0x00]) + ch(result[0x01]) + ch(result[0x02]) + ch(result[0x03]) + ch(result[0x04]) + ch(result[0x05]) !== "RTTXTR") {
        if (ch(result[0x00]) + ch(result[0x01]) + ch(result[0x02]) + ch(result[0x03]) + ch(result[0x04]) + ch(result[0x05]) === "RTPACK") {
            result = pako.inflate(result.slice(32));
            pk = true;
        } else throw new Error("Not a valid RTTEX.");
    }
    filename = name;
    // If we're using pako, check if we managed to get the RTTXTR
    if (pk) {
        var header = "";
        // Loop for the header, instead of creating needlessly long if statement
        for (var j = 0x00; j <= 0x05; j++) {
            header += String.fromCharCode(result[j]);
        }
        // Check if header is what we wanted it to be
        if (header !== "RTTXTR") throw new Error("Not a valid RTTEX.");
    }
	function str2hex (st) {
		if (st.length % 2 == 1) return "0"+st;
		return st;
	}
    // Height is 4 bytes
	var height = "";
	var packedHeight = "";
	for (var b = 0x0B; b >= 0x08; b--) {
		packedHeight += str2hex(result[b].toString(16));
	}
	for (var b2 = 0x17; b2 >= 0x14; b2--) {
		height += str2hex(result[b2].toString(16));
	}
	packedHeight = parseInt(packedHeight, 16);
	height = parseInt(height, 16);
    // Width is 4 bytes
	var width = "";
	var packedWidth = "";
	for (var b = 0x0F; b >= 0x0C; b--) {
		packedWidth += str2hex(result[b].toString(16));
	}
	for (var b2 = 0x1B; b2 >= 0x18; b2--) {
		width += str2hex(result[b2].toString(16));
	}
	packedWidth = parseInt(packedWidth, 16);
	width = parseInt(width, 16);
    var usesAlpha = result[0x1C];
    // Debug console.log
    console.log("-- Header Data for " + name + " --\n\nWidth - " + width + "px\nHeight - " + height + "px\nAlpha - " + usesAlpha + "\nCompression - " + pk);
    // Set canvas dimensions
	if (rt_disable_img_render == false) {
		c.width = width;
		c.height = height;
		// Set container dimensions
		cont.style.width = width + "px";
		cont.style.height = height + "px";
	}
    // Start pointing at the bitmap data, we don't need any other data
    var pointer = 0x7C;
    // Loop by each height layer
	var arr = [];
    for (var h = packedHeight - 1; h >= 0; h--) {
		// and by each width
		for (var w = 0; w < packedWidth; w++) {
			if (usesAlpha && w < width) {
				// Fetch rgba data from the bitmap, if alpha it should be byte,byte,byte,byte per pixel
				arr.push(result[pointer++]);
				arr.push(result[pointer++]);
				arr.push(result[pointer++]);
				arr.push(result[pointer++]);
			} else if (w < width) {
				// Fetch rgb data from the bitmap, if not alpha it should be byte,byte,byte per pixel, and completely opaque
				arr.push(result[pointer++]);
				arr.push(result[pointer++]);
				arr.push(result[pointer++]);
				arr.push(255);
			} else {
				// Skip pointer on packed width areas, since we don't need them.
				if (usesAlpha) pointer += 4;
				else pointer += 3;
			}
		}
    }
	// CONCLUDE BENCHMARK -- RTTEX TO PNG
	console.log("[BENCHMARK] Backend RTTEX to PNG OG: " + width + "x" + height + " POW: " + packedWidth + "x" + packedHeight + " concluded with " + (Date.now() - benchRP) + "ms.");
	if (rt_disable_img_render == false) {
		var iData = ctx.getImageData(0,0,width,packedHeight);
		iData.data.set(new Uint8ClampedArray(arr.slice(0, width*packedHeight*4)));
		ctx.putImageData(iData, 0, -(packedHeight - height));
		ctx.transform(1, 0, 0, -1, 0, c.height)
		ctx.globalCompositeOperation = "copy";
		ctx.drawImage(c,0,0);
		ctx.globalCompositeOperation = "source-over";
	}
}

function clickFile() {
    document.getElementById('fileinput').click();
}

function save() {
    // Save code, borrowed from my planner.
    var c = document.getElementById("canvas");
    var a = document.createElement('a');
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    a.href = c.toDataURL();
    a.download = filename.split(".")[0] + ".png";
    if (window.navigator.userAgent.indexOf("Edge") === -1) {
        a.click();
        a.remove();
    } else {
        var blob = new Blob([b64toBlob(c.toDataURL().replace(/^data:image\/(png|jpg);base64,/, ""), "image/png")], {
            type: "image/png"
        });
        navigator.msSaveBlob(blob, filename.split(".")[0] + ".png");
    }
}
