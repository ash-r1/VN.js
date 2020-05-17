varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;
uniform float weight;

void main(void)
{
    vec4 a = texture2D(mapSampler, vFilterCoord);
    vec4 b = texture2D(uSampler, vTextureCoord);
    gl_FragColor = (1.0 - weight) * a + weight * b;
}
