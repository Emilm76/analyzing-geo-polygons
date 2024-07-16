import distance from "@turf/distance"
import { point } from "@turf/helpers"

export function round(num: number, dc: number) {
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

export function getDistance(point1: number[], point2: number[]) {
  const p1 = point(point1)
  const p2 = point(point2)
  const d = distance(p1, p2, {
    units: "meters",
  })
  return {
    dist: d,
    pointsCoords: [p1, p2],
  }
}
