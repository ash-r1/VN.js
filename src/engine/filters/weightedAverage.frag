varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D otherSampler;
uniform float weight;
uniform vec2 otherPos;

void main(void)
{
    vec4 a = texture2D(uSampler, vTextureCoord);
    vec2 shiftedCoord = vFilterCoord - otherPos;
    vec4 b = texture2D(otherSampler, shiftedCoord);
    gl_FragColor = (1.0 - weight) * a + weight * b;
}
