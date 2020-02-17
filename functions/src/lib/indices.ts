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
  return value
    .split(' ')
    .map(v => v.trim())
    .filter(v => v !== '')
    .map(v => generateIndices(v))
    .reduce((result, indices) => [...result, ...indices], [])
}
