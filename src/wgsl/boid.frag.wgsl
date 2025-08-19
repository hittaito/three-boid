fn frag(
  color: vec3f,
  vPos: vec4f,
  vNormal: vec3f,
  shadowMap: texture_depth_2d,
  sampler1: sampler_comparison
)-> vec4f {
  let lightSpacePos = object.uProjectMat * object.uViewMat * vec4f(vPos.xyz, 1.);
  var shadowCoord = lightSpacePos.xyz / lightSpacePos.w;
  var xy = shadowCoord.xy * 0.5 + 0.5;
  xy.y = 1. - xy.y;


  let cosTheta = dot(normalize(object.uLightDir), vNormal);
  var bias = 0.005 * tan(acos(cosTheta));
  bias = clamp(bias, 0.0, 0.01);

  var factor = textureSampleCompare(shadowMap, sampler1, xy, shadowCoord.z-bias-.01);


  // diffuse
  var d = clamp(dot(normalize(object.uLightDir), normalize(vNormal)), 0, 1);
  factor *= step(.1, d);

  factor = mix(.3, 1., factor);

  let c = color * factor;
  return vec4f(c, 1);
}
