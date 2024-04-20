module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
    ],
};
// export default function(){
//     return {
//         presets: [
//             ['@babel/preset-env', { targets: { node: 'current' } }],
//             '@babel/preset-typescript',
//         ],
//     }
// };