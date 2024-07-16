import { readFileSync } from "fs"
import { Polygon } from "./types"

const dataPolygons = readFileSync("./data/good-polygons.geojson", "utf-8")
const dataUganda = readFileSync("./data/UGANDA.geojson", "utf-8")
const dataForest = readFileSync("./data/forest.geojson", "utf-8")
const dataRoads = readFileSync("./data/roads.geojson", "utf-8")

export const UGANDA = JSON.parse(dataUganda).features[0]
export const FORESTS_ARR = JSON.parse(dataForest).features
export const ROADS_ARR = JSON.parse(dataRoads).features
export const POLYGONS_ARR = JSON.parse(dataPolygons).features.filter(
  (e: Polygon) => e.geometry.type === "Polygon"
)
export const POINTS_ARR = JSON.parse(dataPolygons).features.filter(
  (e: Polygon) => e.geometry.type === "Point"
)

export const POLYGON_PROPS = [
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
  "isFixed",
  "fixedPoints",
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
]
