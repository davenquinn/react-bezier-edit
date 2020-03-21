import {path} from 'd3-path'
import {pairs} from 'd3-array'
import {
  pixelShift,
  expandControlPoint
} from './helpers'

function generatePath(points: BezierPoint[]) {
  let p = path()
  p.moveTo(points[0].x, points[0].y)

  for (const [p1, p2] of pairs(points)) {

    const c1 = pixelShift(expandControlPoint(p1.controlPoint)[1])
    const c2 = pixelShift(expandControlPoint(p2.controlPoint)[0])

    p.bezierCurveTo(
      p1.x+c1.x,
      p1.y+c1.y,
      p2.x+c2.x,
      p2.y+c2.y,
      p2.x,
      p2.y)
  }

  return p
}

export {generatePath}
