fn update(
  positions: ptr<storage, array<vec3<f32>>, read_write>,
  velocities: ptr<storage, array<vec3<f32>>, read_write>,
  index: u32,
) -> f32 {
  // var positions = storage.positions;
  var position = positions[index];
  var velocity = velocities[index];

  // 基本boid
  let sep = separation(index, positions);
  let ali = alignment(index, positions, velocities);
  let coh = cohesion(index, positions);


  velocity += sep * (object.uSepWeight  );
  velocity += ali * object.uAliWeight;
  velocity += coh * object.uCohWeight;
  let speed = length(velocity);
  if (speed > 3.) {
    velocity = normalize(velocity) *  3.;
  }

  // 中心に向かう力
  velocity += centerForce(position);

  position += velocity * object.uVelFactor;

  positions[index] = position;
  velocities[index] = velocity;

  return 1; // エラーになるのでとりあえず
}

fn centerForce(position: vec3f) -> vec3f {
  let len = length(position);
  let dir = -normalize(position);
  let f = clamp(smoothstep(3, 9, len), 0, 1);

  return dir * f * .025;
}



// 分離
fn separation(
  index: u32,
  positions: ptr<storage, array<vec3<f32>>, read_write>,
) -> vec3f {
  var position = positions[index];
  var steer = vec3f(0.0);
  var count = 0u;

  for (var i = 0u; i < arrayLength(positions); i++) {
    if (i == index) { continue; }

    let diff = position - positions[i];
    let distance = length(diff);

    if (distance < object.uSepRad && distance > 0.0) {
        steer += normalize(diff) / distance; // 距離に反比例
        count++;
    }
  }

  if (count > 0u) {
      steer = steer / f32(count);
      return normalize(steer);
  }
  return vec3f(0.0);
}

// 整列
fn alignment(
  index: u32,
  positions: ptr<storage, array<vec3<f32>>, read_write>,
  velocities: ptr<storage, array<vec3<f32>>, read_write>,
) -> vec3f {
  var position = positions[index];


  var avgVel = vec3f(0.);
  var count = 0u;

  for (var i = 0u; i< arrayLength(positions); i++) {
    if (i == index) {continue;}

    let dist = length(position - positions[i]);

    if (dist < object.uAliRad) {
      avgVel += velocities[i];
      count++;
    }
  }
  if (count > 0u) {
    return normalize(avgVel / f32(count));
  } else {
    return vec3f(0);
  }
}

// 結合
fn cohesion(
  index: u32,
  positions: ptr<storage, array<vec3f>, read_write>
) -> vec3f {
  var position = positions[index];

  var center = vec3f(0);
  var count = 0u;

  for (var i = 0u; i < arrayLength(positions); i++) {
    if (i == index) { continue; }

    let dist = length(position - positions[i]);

    if (dist < object.uCohRad) {
      center += positions[i];
      count++;
    }
  }

  if (count > 0) {
    return normalize(center/f32(count) - position);
  } else {
    return vec3f(0);
  }
}

#include ./struct.wgsl