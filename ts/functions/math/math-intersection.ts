import area from "@turf/area"
import { featureCollection, round } from "@turf/helpers"
import intersect from "@turf/intersect"
import { Polygon } from "../../types"

export function mathIntersection(
  polygon: Polygon,
  secPolArr: Polygon[],
  reverse?: boolean,
  listIt?: boolean,
  ignoreIndex?: number
) {
  const polArea = area(polygon)
  let fullIntersectArea = 0
  let intListNames: [string?] = []
  let intMore5Percent: [string?] = []

  secPolArr.forEach((secondPol: Polygon, i) => {
    if (i === ignoreIndex) return
    const intersection = intersect(featureCollection([polygon, secondPol]))
    if (intersection === null) return
    const intA = area(intersection)
    fullIntersectArea += intA
    if (listIt) {
      const n = secondPol.properties.label
      intListNames.push(n)
      if (intA / polArea > 0.05) intMore5Percent.push(n)
    }
  })

  if (reverse) {
    fullIntersectArea = polArea - fullIntersectArea
  }

  if (fullIntersectArea !== 0) {
    const intersectPercent = round((fullIntersectArea / polArea) * 100, 1)
    return {
      int: true,
      intM2: Math.round(fullIntersectArea),
      intPercent: `${intersectPercent}%`,
      intMore5Percent: intMore5Percent,
      intNames: intListNames,
    }
  } else if (reverse) {
    return {
      intM2: Math.round(polArea),
      intPercent: `100%`,
    }
  }
  return false
}
