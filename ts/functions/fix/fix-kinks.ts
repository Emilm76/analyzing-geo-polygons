import { featureCollection, polygon } from "@turf/helpers"
import kinks from "@turf/kinks"
import simplify from "@turf/simplify"
import { Polygon } from "../../types"

export function fixBugKinks(coords: number[][]) {
  const pol = featureCollection([polygon([coords])])
  const isKink = !!kinks(pol).features.length

  let newCoords: number[][] = []
  if (isKink) {
    newCoords = fix(pol, 0.01)
  }
  return { isFixedKinks: !!newCoords.length, coords: newCoords }
}

function fix(pol: { features: [Polygon] }, tol: number) {
  const fixPolygon = simplify(pol, { tolerance: tol, highQuality: true })
  const isKink = kinks(fixPolygon).features.length

  if (isKink && tol <= 1) return fix(pol, tol + 0.01)
  else return fixPolygon.features[0].geometry.coordinates[0]
}
