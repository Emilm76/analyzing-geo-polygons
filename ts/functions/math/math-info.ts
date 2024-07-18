import area from "@turf/area"
import { convertArea, featureCollection, round } from "@turf/helpers"
import kinks from "@turf/kinks"
import { Polygon } from "../../types"
import { average, getDistance } from "../helpers"

export function mathPolygonPoints(pol: Polygon) {
  const isKink = !!kinks(featureCollection([pol])).features.length
  let distanceArr: number[] = []
  let points: [number][] | [[number]] = pol.geometry.coordinates[0]
  let newPointsArr = [[123]] as [[number]]

  for (let i = 0; i < points.length - 1; i++) {
    let currP = points[i]
    let nextP: any = points[i + 1]

    const dist = getDistance(currP, nextP)
    distanceArr.push(dist.dist)
    newPointsArr.push(currP)
  }
  newPointsArr.push(points[points.length - 1])
  newPointsArr.shift()

  return {
    selfIntersect: isKink,
    pointsDistanceMin: round(Math.min(...distanceArr), 1),
    pointsDistanceMax: round(Math.max(...distanceArr), 1),
    pointsDistanceAverage: round(average(distanceArr), 1),
  }
}

export function mathPolygonSize(polygon: Polygon) {
  const polArea = area(polygon)
  return {
    sizeM2: Math.round(polArea),
    sizeHectares: round(convertArea(polArea, "meters", "hectares"), 2),
    sizeAcres: round(convertArea(polArea, "meters", "acres"), 2),
  }
}
