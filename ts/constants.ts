import { kml } from "@tmcw/togeojson"
import { readFileSync } from "fs"
import { DOMParser } from "xmldom"
import { analyzeCommand } from "./functions/helpers"
import { Polygon } from "./types"

const { inputFile } = analyzeCommand(false)
export const isKmsInputFile = inputFile.indexOf(".kml") !== -1

const dataPolygons = readFileSync(`./data/${inputFile}`, "utf-8")
let polygonsGeojson = { features: [] } as any

if (isKmsInputFile) {
  const kmlD = new DOMParser().parseFromString(dataPolygons)
  const kmlData = kml(kmlD)
  polygonsGeojson = kmlData
} else polygonsGeojson = JSON.parse(dataPolygons)

// console.log(polygonsGeojson)

const dataUganda = readFileSync("./data/UGANDA.geojson", "utf-8")
const dataForest = readFileSync("./data/forest.geojson", "utf-8")
const dataRoads = readFileSync("./data/roads.geojson", "utf-8")

export const UGANDA = JSON.parse(dataUganda).features[0]
export const FORESTS_ARR = JSON.parse(dataForest).features
export const ROADS_ARR = JSON.parse(dataRoads).features
export const POLYGONS_ARR = filterPolygons("Polygon")
export const POINTS_ARR = filterPolygons("Point")

function filterPolygons(filterType: string) {
  return polygonsGeojson.features.filter(
    (e: Polygon) =>
      e.geometry.type === filterType || e.geometry.type === "Multi" + filterType
  )
}

export const POLYGON_PROPS = [
  "isFixedPoints",
  "fixedPoints",
  "isFixedKinks",
  "inUganda",
  "sizeOutsideUgandaM2",
  "sizeOutsideUgandaPercent",
  "distanceToMainRoadKm",
  "intersectPolygon",
  "intersectPolygonNames",
  "intersectMoreFivePercent",
  "intersectPolygonM2",
  "intersectPolygonPercent",
  "intersectForest",
  "intersectForestM2",
  "intersectForestPercent",
  "selfIntersect",
  "pointsDistanceMin",
  "pointsDistanceMax",
  "pointsDistanceAverage",
  "sizeM2",
  "sizeHectares",
  "sizeAcres",
  "wip",
  "entity",
  "label",
  "areaAc",
  "areaHa",
  "selfIntersects",
  "areaCalculated",
  "areaManual",
  "pointCount",
  "createdDate",
  "updatedBy",
  "notes",
  "name",
  "farm",
  "description",
  "styleUrl",
  "fill-opacity",
  "fill",
  "stroke-opacity",
  "stroke",
]
