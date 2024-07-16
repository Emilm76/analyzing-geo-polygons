import { readFileSync } from "fs"
import { Polygon } from "./types"

const dataPolygons = readFileSync("./data/good-polygons.geojson", "utf-8")
const dataUganda = readFileSync("./data/UGANDA.geojson", "utf-8")
const dataForest = readFileSync("./data/forest.geojson", "utf-8")
const dataRoads = readFileSync("./data/roads.geojson", "utf-8")

export const uganda = JSON.parse(dataUganda).features[0]
export const forestsArr = JSON.parse(dataForest).features
export const roadsArr = JSON.parse(dataRoads).features
export const polygonsArr = JSON.parse(dataPolygons).features.filter(
  (e: Polygon) => e.geometry.type === "Polygon"
)
export const pointsArr = JSON.parse(dataPolygons).features.filter(
  (e: Polygon) => e.geometry.type === "Point"
)
