let charSet = 'abcdef0163456789'
export const generateFxHash = () => Array(64).fill(0).map(_ => charSet[(Math.random() * charSet.length)|0]).join('')