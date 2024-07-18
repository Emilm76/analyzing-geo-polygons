## To run the script:

`yarn start` _- input file is "data/good-polygons.geojson"_

`yarn start:kml` _- input file is "data/24-B22Polygons.kml"_

**You can use this flags:**

- `--fixPoints=30`

_This means that all polygon points located further than 30 meters from the neighboring ones will be deleted. Then new points will be inserted in their place._

- `--fixKinks`

_This means that all polygons with self-intersections will be corrected_

**Example:**

`yarn start  --fixPoints=20 --fixKinks`
