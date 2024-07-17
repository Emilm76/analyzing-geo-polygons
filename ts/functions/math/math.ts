import booleanContains from "@turf/boolean-contains"
import centroid from "@turf/centroid"
import distance from "@turf/distance"
import { point, round } from "@turf/helpers"
import {
  FORESTS_ARR,
  POLYGONS_ARR,
  ROADS_ARR,
  UGANDA,
} from "../../constants.js"
import {
  IntersectForest,
  IntersectPol,
  PointsInfo,
  Polygon,
  SizeOut,
} from "../../types.js"
import { mathPolygonPoints, mathPolygonSize } from "./math-info.js"
import { mathIntersection } from "./math-intersection.js"

export function math(polygon: Polygon, index: number) {
  let isInUganda = booleanContains(UGANDA, polygon)
  let intersectPol: IntersectPol = false
  let sizeOut: SizeOut = false

  if (!isInUganda) {
    // Size outside Uganda
    const u = mathIntersection(polygon, [UGANDA], true)
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
  const f = mathIntersection(polygon, FORESTS_ARR)
  let intersectForest: IntersectForest = f && {
    intersectForest: f.int,
    intersectForestM2: f.intM2,
    intersectForestPercent: f.intPercent,
  }

  // Intersection with another polygons
  const p = mathIntersection(polygon, POLYGONS_ARR, false, true, index)
  intersectPol = p && {
    intersectPolygon: p.int,
    intersectPolygonNames: p.intNames,
    intersectMoreFivePercent: p.intMore5Percent,
    intersectPolygonM2: p.intM2,
    intersectPolygonPercent: p.intPercent,
  }

  const polygonPointsInfo: PointsInfo = mathPolygonPoints(polygon)
  const polygonSizeInfo = mathPolygonSize(polygon)

  // Add new polygon properties
  return {
    inUganda: isInUganda,
    ...(sizeOut && sizeOut),
    ...roadsInfo,
    ...(intersectPol ? intersectPol : { intersectPolygon: false }),
    ...(intersectForest ? intersectForest : { intersectForest: false }),
    ...polygonPointsInfo,
    ...polygonSizeInfo,
    ...polygon.properties,
  }
}
