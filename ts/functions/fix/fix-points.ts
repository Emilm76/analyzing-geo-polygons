import bearing from "@turf/bearing"
import destination from "@turf/destination"
import distance from "@turf/distance"
import { point } from "@turf/helpers"
import midpoint from "@turf/midpoint"
import { getDistanceBetweenPoints } from "../helpers"

export function fixBugPoints(coords: number[][], fixAfterMeters: number) {
  let distAroundPoints = []
  let points = coords.slice(0)
  const pl = points.length
  let fixedPoints = 0
  // Get distance to other each point
  for (let i = 0; i < points.length; i++) {
    const prePoint = points[i ? i - 1 : pl - 1]
    const postPoint = points[i === pl - 1 ? 0 : i + 1]
    const currP = points[i]
    const distLeft = getDistanceBetweenPoints(currP, prePoint).dist
    const distRight = getDistanceBetweenPoints(currP, postPoint).dist

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
    ++fixedPoints
  }

  if (fixedPoints === 0 || fixedPoints === points.length)
    return { props: { isFixedPoints: false } }

  // Get indexes of the edge points
  let edgePointsIndexes: number[][] = []
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    if (p !== undefined) continue

    const preIndex = getPreIndex(points, i)

    if (preIndex !== -1) {
      edgePointsIndexes.push([preIndex])
      const postIndex = getPostIndex(points, i)
      const lastArr = edgePointsIndexes.length - 1
      edgePointsIndexes[lastArr].push(postIndex)
      i = postIndex + 1
    }

    function getPreIndex(arr: number[][], currIndex: number) {
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
        else return -1
      }
    }

    function getPostIndex(arr: number[][], currIndex: number) {
      if (arr[currIndex] === undefined) {
        const postI = currIndex === arr.length - 1 ? 0 : currIndex + 1
        return getPostIndex(arr, postI)
      } else return currIndex
    }
  }

  // Replace deleted point to new
  for (const arr of edgePointsIndexes) {
    const a = arr[0]
    const b = arr[1]
    const countDeletedPoints = b > a ? b - a - 1 : points.length - 1 - a + b

    const newPoints: number[][] = createNewPoints(
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

  return {
    props: {
      isFixedPoints: !!fixedPoints,
      ...(!!fixedPoints && { fixedPoints: fixedPoints }),
    },
    coords: fixEdgesCoords(points),
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

function fixEdgesCoords(coords: number[][]) {
  let points = coords
  const firstCoord = points[0]
  const lastCoord = points[points.length - 1]

  if (firstCoord[0] !== lastCoord[0] && firstCoord[1] !== lastCoord[1]) {
    points[points.length] = firstCoord
  }
  return points
}
