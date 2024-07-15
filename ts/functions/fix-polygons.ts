import bearing from "@turf/bearing"
import destination from "@turf/destination"
import distance from "@turf/distance"
import { point } from "@turf/helpers"
import midpoint from "@turf/midpoint"
import { Polygon } from "../types"
import { average, round } from "./helpers"

export function calcPolygonPoints(
  polygon: Polygon,
  fix: boolean,
  fixAfterMeters: number
) {
  let distanceArr: number[] = []
  let points: [number][] | [[number]] = polygon.geometry.coordinates[0]
  let newPointsArr = [9] as [any]

  if (fix) {
    fixBugPoints(points, fixAfterMeters)
  }

  for (let i = 0; i < points.length - 1; i++) {
    const currP = points[i]

    // const dist = getDistance(currP, points[i + 1])
    // distanceArr.push(dist.dist)
    newPointsArr.push(currP)
  }
  newPointsArr.push(points[points.length - 1])
  fix && newPointsArr.shift()

  return {
    props: {
      pointsDistanceMin: round(Math.min(...distanceArr), 1),
      pointsDistanceMax: round(Math.max(...distanceArr), 1),
      pointsDistanceAverage: round(average(distanceArr), 1),
    },
    coordinates: newPointsArr,
  }
}

function fixBugPoints(points: [number][] | [[number]], fixAfterMeters: number) {
  let distAroundPoints = []
  const pl = points.length

  for (let i = 0; i < points.length; i++) {
    const prePoint = points[i ? i - 1 : pl - 1]
    const postPoint = points[i === pl - 1 ? 0 : i + 1]
    const currP = points[i]
    const distLeft = getDistance(currP, prePoint).dist
    const distRight = getDistance(currP, postPoint).dist

    distAroundPoints.push([
      !!(distLeft > fixAfterMeters),
      !!(distRight > fixAfterMeters),
    ])
  }

  // Delete points
  for (let i = distAroundPoints.length - 1; i > -1; i--) {
    const isBugPoint = distAroundPoints[i]
    if (isBugPoint[0] === false && isBugPoint[1] === false) continue

    // [ true, true ]
    if (isBugPoint[0] === isBugPoint[1]) delete points[i]
    // [ true, false ] or [ false, true ]
    else {
      const pre = distAroundPoints[i !== 0 ? i - 1 : pl - 1]
      const post = distAroundPoints[i === pl - 1 ? 0 : i + 1]

      if (pre[0] === false && pre[1] === false) continue
      if (post[0] === false && post[1] === false) continue

      delete points[i]
    }
  }

  let edgePointsIndexes: any = []

  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    if (p !== undefined) continue

    const preIndex = getPreIndex(points, i)
    if (preIndex) {
      edgePointsIndexes.push([preIndex])
      const postIndex = getPostIndex(points, i)
      const lastArr = edgePointsIndexes.length - 1
      edgePointsIndexes[lastArr].push(postIndex)
      i = postIndex + 1
    }

    function getPreIndex(arr: any[], currIndex: number) {
      if (arr[currIndex] === undefined) {
        const preI = currIndex !== 0 ? currIndex - 1 : arr.length - 1

        return getPreIndex(arr, preI)
      } else {
        let isNewIndex = true
        for (const a of edgePointsIndexes) {
          if (a.find((e: number) => e === currIndex)) {
            isNewIndex = false
            break
          }
        }
        if (isNewIndex) return currIndex
      }
    }

    function getPostIndex(arr: any[], currIndex: number) {
      if (arr[currIndex] === undefined) {
        const postI = currIndex === arr.length - 1 ? 0 : currIndex + 1
        return getPostIndex(arr, postI)
      } else return currIndex
    }
  }

  for (const arr of edgePointsIndexes) {
    const a = arr[0]
    const b = arr[1]
    const countDeletedPoints = b > a ? b - a - 1 : points.length - 1 - a + b

    const newPoints: any = createNewPoints(
      points[a],
      points[b],
      countDeletedPoints
    )

    for (let i = 0; i < countDeletedPoints; i++) {
      const currIndex = a + i + 1
      points[
        currIndex <= points.length - 1 ? currIndex : currIndex - points.length
      ] = newPoints[i]
    }
  }

  points = fixEdgesCoords(points)
}

function getDistance(point1: number[], point2: number[]) {
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
function createNewPoints(
  betweenP1: number[],
  betweenP2: number[],
  countPoints: number
) {
  const p1 = point(betweenP1)
  const p2 = point(betweenP2)
  let newPoints = []
  if (countPoints === 1) {
    newPoints = [midpoint(p1, p2).geometry.coordinates]
  } else {
    const deg = bearing(p1, p2)
    const dist = distance(p1, p2)
    const partDist = dist / (countPoints + 1)
    for (let i = 0; i < countPoints; i++) {
      const d = destination(p1, partDist * (i + 1), deg)
      newPoints.push(d.geometry.coordinates)
    }
  }
  return newPoints
}

function fixEdgesCoords(coords: [number][]) {
  let points = coords
  const firstCoord = points[0]
  const lastCoord = points[points.length - 1]

  if (firstCoord !== lastCoord) {
    points[points.length] = firstCoord
  }
  return points
}
