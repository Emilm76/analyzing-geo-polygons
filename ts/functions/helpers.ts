import centroid from "@turf/centroid"
import distance from "@turf/distance"
import { point, round } from "@turf/helpers"
import yargs from "yargs/yargs"
import { Polygon } from "../types"

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

export function getDistanceBetweenPoints(point1: number[], point2: number[]) {
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

export function getDistanceBetweenPolygons(polygon: Polygon, array: Polygon[]) {
  let distanceArr: number[] = []

  array.forEach((pol2) => {
    const p1 = centroid(polygon)
    // console.log(pol2)
    // console.log(pol2.geometry.coordinates[0])
    let coords: [[number]] | [number] = pol2.geometry.coordinates[0]
    Array.isArray(coords[0][0]) && (coords = coords[0])

    coords.forEach((c) => {
      const p2 = point(c)
      getDistance(p1, p2)
    })

    function getDistance(point1: Polygon, point2: Polygon) {
      const d = distance(point1, point2)
      distanceArr.push(d)
    }
  })

  return round(getMin(distanceArr), 1)
}

function getMin(arr: number[]) {
  return arr.reduce((min, v) => (min <= v ? min : v), Infinity)
}
