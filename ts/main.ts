import booleanContains from "@turf/boolean-contains"
import yargs from "yargs/yargs"
import { forestsArr, pointsArr, polygonsArr, uganda } from "./constants.js"
import { calcIntersection, calcPolygonSize } from "./functions/calc.js"
import { calcPolygonPoints } from "./functions/fix-polygons.js"
import { saveFile } from "./functions/save-files.js"
import { IntersectForest, IntersectPol, Polygon, SizeOut } from "./types.js"

console.log("Script start...")

const argv = yargs(process.argv.slice(2))
  .options({
    fixPoints: { type: "number", default: false },
  })
  .parseSync()

let isFixPointsOption = 0
if (argv.fixPoints) {
  isFixPointsOption = argv.fixPoints === true ? 20 : argv.fixPoints
}
console.log("--fixPoints=", isFixPointsOption)

// let fixedPol = 0

polygonsArr.forEach((polygon: Polygon, index: number) => {
  let sizeOut: SizeOut = false
  let intersectForest: IntersectForest = false
  let intersectPol: IntersectPol = false
  let isInUganda = booleanContains(uganda, polygon)

  if (!isInUganda) {
    // Size outside Uganda
    const u = calcIntersection(polygon, [uganda], true)
    sizeOut = u && {
      sizeOutsideUgandaM2: u.intM2,
      sizeOutsideUgandaPercent: u.intPercent,
    }
  } else {
    // Forest intersection
    const f = calcIntersection(polygon, forestsArr)
    intersectForest = f && {
      intersectForest: f.int,
      intersectForestM2: f.intM2,
      intersectForestPercent: f.intPercent,
    }
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

  const polygonPointsInfo = calcPolygonPoints(
    polygon,
    !!isFixPointsOption,
    isFixPointsOption
  )
  const polygonSizeInfo = calcPolygonSize(polygon)

  // Add new properties in polygon
  polygon.properties = {
    inUganda: isInUganda,
    ...(sizeOut && sizeOut),
    ...(intersectPol ? intersectPol : { intersectPolygon: false }),
    ...(intersectForest ? intersectForest : { intersectForest: false }),
    // ...polygonPointsInfo.props,
    ...polygonSizeInfo,
    ...polygon.properties,
  }
  // isFixPolOption &&
  //   (polygon.geometry.coordinates = [polygonPointsInfo.coordinates])
})

console.log("Total polygons: " + polygonsArr.length)
// console.log("Fix polygons: " + fixedPol)

// Save polygons.js file
await saveFile("./result/", "polygons.json", {
  type: "FeatureCollection",
  features: [...polygonsArr, ...pointsArr],
})
// Save polygons in CSV files
// await saveCsvFiles(polygonsArr, "./result/polygons-CSV/")
