import { Fix } from "../../types"
import { fixBugKinks } from "./fix-kinks"
import { fixBugPoints } from "./fix-points"

export function fix(
  coords: number[][],
  fixAfterMeters: number,
  isFixKinks: boolean
) {
  const fixPoints = !!fixAfterMeters && fixBugPoints(coords, fixAfterMeters)
  const coordsFixPoints = (fixPoints && fixPoints.coords) || coords
  const fixKinks = isFixKinks && fixBugKinks(coordsFixPoints)

  return {
    props: {
      ...(fixPoints && fixPoints.props),
      ...(fixKinks && { isFixedKinks: fixKinks.isFixedKinks }),
    },
    coords: (fixKinks && fixKinks.coords) || coordsFixPoints,
  } as Fix
}
