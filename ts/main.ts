import booleanContains from "@turf/boolean-contains"
import centroid from "@turf/centroid"
import distance from "@turf/distance"
import { point } from "@turf/helpers"
import yargs from "yargs/yargs"
import {
  FORESTS_ARR,
  POINTS_ARR,
  POLYGONS_ARR,
  ROADS_ARR,
  UGANDA,
} from "./constants.js"
import {
  calcIntersection,
  calcPolygonPoints,
  calcPolygonSize,
} from "./functions/calc.js"
import { round } from "./functions/helpers.js"
import { saveCsvFile, saveJsonFile } from "./functions/save-files.js"
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

POLYGONS_ARR.forEach((polygon: Polygon, index: number) => {
  let sizeOut: SizeOut = false
  let intersectPol: IntersectPol = false
  let isInUganda = booleanContains(UGANDA, polygon)

  // Info about polygon
  const polygonPointsInfo: PointsInfo = calcPolygonPoints(
    polygon,
    !!isFixPointsOption,
    isFixPointsOption
  )
  if (polygonPointsInfo.props.isFixed) fixedPol++

  if (!isInUganda) {
    // Size outside Uganda
    const u = calcIntersection(polygon, [UGANDA], true)
    sizeOut = u && {
      sizeOutsideUgandaM2: u.intM2,
      sizeOutsideUgandaPercent: u.intPercent,
    }
  }

  // Roads intersection
  // const r = calcIntersection(polygon, roadsArr)
  let distanceArr: number[] = []
  ROADS_ARR.forEach((road: Polygon) => {
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
  const f = calcIntersection(polygon, FORESTS_ARR)
  let intersectForest: IntersectForest = f && {
    intersectForest: f.int,
    intersectForestM2: f.intM2,
    intersectForestPercent: f.intPercent,
  }

  // Intersection with another polygons
  const p = calcIntersection(polygon, POLYGONS_ARR, false, true, index)
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

console.log("Total polygons: " + POLYGONS_ARR.length)
console.log("Fix polygons: " + fixedPol)

// Save polygons.js file
await saveJsonFile("./result/", "polygons.geojson", {
  type: "FeatureCollection",
  features: [...POLYGONS_ARR, ...POINTS_ARR],
})
// Save polygons in CSV file
await saveCsvFile(POLYGONS_ARR, "./result/", "polygons.csv")
