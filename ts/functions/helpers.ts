import distance from "@turf/distance"
import { point } from "@turf/helpers"
import yargs from "yargs/yargs"

export function analyzeCommand(showLogs: boolean) {
  const argv = yargs(process.argv.slice(2))
    .options({
      inputFile: { type: "string", default: "" },
      fixPoints: { type: "number", default: 0 },
      fixKinks: { type: "boolean", default: false },
    })
    .parseSync()

  const inputFile = argv.inputFile
  const isFixPoints = argv.fixPoints
  const isFixKinks = argv.fixKinks

  if (showLogs) {
    console.log("--inputFile", inputFile)
    console.log("--fixPoints", isFixPoints)
    console.log("--fixKinks", isFixKinks)
  }

  return {
    inputFile: inputFile,
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
