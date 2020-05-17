// https://blog.5ebec.dev/posts/webpack-typescript-three-js-%E3%81%A7-glsl-frag-vert-%E3%82%92%E5%A4%96%E9%83%A8%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%A8%E3%81%97%E3%81%A6-import-%E3%81%99%E3%82%8B/
declare module '*.vert' {
  const src: string;
  export default src;
}
declare module '*.frag' {
  const src: string;
  export default src;
}
