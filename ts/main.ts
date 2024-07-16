import booleanContains from "@turf/boolean-contains"
import centroid from "@turf/centroid"
import distance from "@turf/distance"
import { point } from "@turf/helpers"
import yargs from "yargs/yargs"
import {
  forestsArr,
  pointsArr,
  polygonsArr,
  roadsArr,
  uganda,
} from "./constants.js"
import {
  calcIntersection,
  calcPolygonPoints,
  calcPolygonSize,
} from "./functions/calc.js"
import { round } from "./functions/helpers.js"
import { saveCsvFiles, saveJsonFile } from "./functions/save-files.js"
import {
  IntersectForest,
  IntersectPol,
  PointsInfo,
  Polygon,
  SizeOut,
} from "./types.js"

// Optional options
const argv = yargs(process.argv.slice(2))
  .options({ fixPoints: { type: "number", default: 0 } })
  .parseSync()
let isFixPointsOption = argv.fixPoints
let fixedPol = 0
console.log("--fixPoints", isFixPointsOption)
console.log("Script start...")

polygonsArr.forEach((polygon: Polygon, index: number) => {
  let sizeOut: SizeOut = false
  let intersectPol: IntersectPol = false
  let isInUganda = booleanContains(uganda, polygon)

  // Info about polygon
  const polygonPointsInfo: PointsInfo = calcPolygonPoints(
    polygon,
    !!isFixPointsOption,
    isFixPointsOption
  )
  if (polygonPointsInfo.props.isFixed) fixedPol++

  if (!isInUganda) {
    // Size outside Uganda
    const u = calcIntersection(polygon, [uganda], true)
    sizeOut = u && {
      sizeOutsideUgandaM2: u.intM2,
      sizeOutsideUgandaPercent: u.intPercent,
    }
  }

  // Roads intersection
  // const r = calcIntersection(polygon, roadsArr)
  let distanceArr: number[] = []
  roadsArr.forEach((road: Polygon) => {
    const p1 = centroid(polygon)
    road.geometry.coordinates[0].forEach((r) => {
      const p2 = centroid(point(r))
      const d = distance(p1, p2)
      distanceArr.push(d)
    })
  })
  let roadsInfo = {
    // intersectRoads: r && r.int,
    distanceToMainRoadKm: round(Math.min(...distanceArr), 1),
  }

  // Forest intersection
  const f = calcIntersection(polygon, forestsArr)
  let intersectForest: IntersectForest = f && {
    intersectForest: f.int,
    intersectForestM2: f.intM2,
    intersectForestPercent: f.intPercent,
  }

  // Intersection with another polygons
  const p = calcIntersection(polygon, polygonsArr, false, true, index)
  intersectPol = p && {
    intersectPolygon: p.int,
    intersectPolygonNames: p.intNames,
    intersectMoreFivePercent: p.intMore5Percent,
    intersectPolygonM2: p.intM2,
    intersectPolygonPercent: p.intPercent,
  }

  const polygonSizeInfo = calcPolygonSize(polygon)

  // Add new properties in polygon
  polygon.properties = {
    inUganda: isInUganda,
    ...(sizeOut && sizeOut),
    ...roadsInfo,
    ...(intersectPol ? intersectPol : { intersectPolygon: false }),
    ...(intersectForest ? intersectForest : { intersectForest: false }),
    ...polygonPointsInfo.props,
    ...polygonSizeInfo,
    ...polygon.properties,
  }
  isFixPointsOption &&
    (polygon.geometry.coordinates = [polygonPointsInfo.coordinates])
})

console.log("Total polygons: " + polygonsArr.length)
console.log("Fix polygons: " + fixedPol)

// Save polygons.js file
await saveJsonFile("./result/", "polygons.geojson", {
  type: "FeatureCollection",
  features: [...polygonsArr, ...pointsArr],
})
// Save polygons in CSV files
await saveCsvFiles(polygonsArr, "./result/polygons-CSV/")
