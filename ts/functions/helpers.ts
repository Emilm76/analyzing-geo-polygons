import distance from "@turf/distance"
import { point } from "@turf/helpers"
import yargs from "yargs/yargs"

export function analyzeCommand() {
  const argv = yargs(process.argv.slice(2))
    .options({
      fixPoints: { type: "number", default: 0 },
      fixKinks: { type: "boolean", default: false },
    })
    .parseSync()
  const isFixPoints = argv.fixPoints
  const isFixKinks = argv.fixKinks
  console.log("--fixPoints", isFixPoints)
  console.log("--fixKinks", isFixKinks)
  return {
    isFixPoints: isFixPoints,
    isFixKinks: isFixKinks,
  }
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
