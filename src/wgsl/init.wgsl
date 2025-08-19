fn initialize(
  positions: ptr<storage, array<vec3<f32>>, read_write>,
  velocities: ptr<storage, array<vec3<f32>>, read_write>,
  colors: ptr<storage, array<vec3<f32>>, read_write>,
  index: u32
) -> f32 {
  var i = f32(index);
  // position
  var r = pow(hash13(i+.1), 1./3.) * 9;
  var phi = (hash13(i+.14320) - .5) * PI;
  var theta = hash13(i+.32293) * 2 * PI;
  var newPosition = vec3<f32>(
    r * cos(phi) * sin(theta),
    r * cos(phi) * cos(theta),
    r * sin(phi)
  );

  // velocity
  var x = hash13(i+.312303) - .5;
  var y = hash13(i+ 13.12303) - .5;
  var z = hash13(i+324.640) - .5;
  var w = hash13(i+94.2340) - .5;
  var newVelocity = normalize(vec3<f32>(x,y,z)) * .01;

  var color = vec3(19., 62., 135.)/255.;
  let a = hash13(i+90234.21);
  if (a > .333) {color = vec3f(96., 139., 193.)/255.;}
  if (a > .666) {color = vec3f(203., 220., 235.)/255.;}

  positions[index] = newPosition;
  velocities[index] = newVelocity;
  colors[index] = color;

  return 1;
}
const PI = acos(-1);

#include ./struct.wgsl



// ハッシュ関数（ランダム生成用）
fn hash13(p: f32) -> f32 {
    var p3 = fract(vec3f(p) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}