export function round(num: number, dc = 0) {
  function p(n: number) {
    var r = 1
    for (var i = 0; i < dc; i++) r = r * 10
    return dc ? n * r : 1
  }
  return Math.round(num * p(1)) / p(1)
}

export function average(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}
