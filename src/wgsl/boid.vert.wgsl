fn vertex(
  modelMat: mat4x4<f32>,
  localPos: vec3f,
  instancePos: vec3f,
  instanceVel: vec3f) -> vec4<f32> {
    var axis = cross(vec3f(0,-1,0), normalize(instanceVel));
    let dot_product = dot(normalize(vec3f(0,-1,0)), normalize(instanceVel));
    let clamped_dot = clamp(dot_product, -1.0, 1.0);
    let angle = acos(clamped_dot);

    let q = rotQ(axis, angle);
    let p = appQ(localPos, q);

    var pos = modelMat * vec4f(instancePos+p, 1.);
    return pos;
}

fn rotQ(axis: vec3f, rad: f32) -> vec4f {
  let n = normalize(axis);
  let h = rad * .5;
  let s = sin(h);
  return vec4f(n * s, cos(h));
}
fn conQ(q: vec4f) -> vec4f {
  return vec4f(-q.xyz, q.w);
}
fn mulQ(q1: vec4f, q2: vec4f) -> vec4f {
  return vec4f(q2.w * q1.x - q2.z * q1.y + q2.y * q1.z + q2.x * q1.w,
               q2.z * q1.x + q2.w * q1.y - q2.x * q1.z + q2.y * q1.w,
              -q2.y * q1.x + q2.x * q1.y + q2.w * q1.z + q2.z * q1.w,
              -q2.x * q1.x - q2.y * q1.y - q2.z * q1.z + q2.w * q1.w);
}
fn appQ(v: vec3f, q: vec4f) -> vec3f {
  let vq = vec4(v, 0.);
  let cq = conQ(q);
  let mq = mulQ(mulQ(cq, vq), q);
  return mq.xyz;
}