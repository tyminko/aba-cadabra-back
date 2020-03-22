function generateIndices(value: string): string[] {
  const result: string[] = []
  let curName = ''
  value.split('').forEach(letter => {
    curName += letter
    result.push(curName)
  })
  return result
}

export default (value: string): string[] => {
  const words = value.split(' ').map(v => v.trim()).filter(v => v !== '')
  const wordsIndices = words
    .map(v => generateIndices(v))
    .reduce((result, indices) => [...result, ...indices], [])
  if (words.length > 1) {
    return [...wordsIndices, ...generateIndices(words.join(' '))]
  } else {
    return wordsIndices
  }
}
