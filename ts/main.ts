import { isKmsInputFile, POINTS_ARR, POLYGONS_ARR } from "./constants.js"
import { fix } from "./functions/fix/fix.js"
import { analyzeCommand } from "./functions/helpers.js"
import { math } from "./functions/math/math.js"
import { saveCsvFile, saveJsonFile } from "./functions/save-files.js"
import { Fix, Polygon } from "./types.js"

const { isFixPoints, isFixKinks } = analyzeCommand(true)
console.log("Script start...")
let fixedPol = 0

POLYGONS_ARR.forEach((polygon: Polygon, index: number) => {
  // Fixing polygons
  let fixInfo: Fix = { props: {}, coords: [[1]] }
  if (isFixPoints || isFixKinks) {
    const p = polygon.geometry.coordinates[0]
    fixInfo = fix(p, isFixPoints, isFixKinks)
    if (fixInfo.coords.length > 1)
      polygon.geometry.coordinates = [fixInfo.coords]
    if (fixInfo.props.isFixedPoints || fixInfo.props.isFixedKinks) fixedPol++
  }

  // Calculate info about polygon
  const mathInfo = math(polygon, index)

  // Add new properties in polygon
  polygon.properties = {
    ...fixInfo.props,
    ...mathInfo,
  }
})

console.log("Total polygons: " + POLYGONS_ARR.length)
console.log("Fix polygons: " + fixedPol)

const resultFolder = isKmsInputFile ? "./result-kml/" : "./result/"
// Save polygons.js file
await saveJsonFile(resultFolder, "polygons.geojson", {
  type: "FeatureCollection",
  features: [...POLYGONS_ARR, ...POINTS_ARR],
})
// Save polygons in CSV file
await saveCsvFile(POLYGONS_ARR, resultFolder, "polygons.csv")
