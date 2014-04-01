var THREE = require('./three-r65')

function ParticleSystem(radius) {

  // Particle system.
  var ps = new THREE.Object3D()

  ps.radius = radius || 500
  ps.boundary = ps.radius
  ps.equilibrium = false
  ps.cellPadding = 20

  ps.updateCells = function() {
    var particles = this.children
      , repelForce = new THREE.Vector3(0,0,0)
      , repelStrength, mag
      , capacity = 0  // space availability metric.
      , density  = 0  // space deficit quantity.

    if (!this.equilibrium) {

      for (i=0, l=particles.length; i<l; i++) {
        var p1 = particles[i]

        repelForce.copy(p1.position)

        mag = repelForce.length()
        repelStrength = (mag - this.boundary) *-0.1

        if (repelStrength < 0) {
          repelForce.multiplyScalar(repelStrength/mag)
          p1.position.add(repelForce)
        }

        if (i >= l-1) continue  // end of stack!

        for (j=i+1; j<particles.length; j++) {
          var p2 = particles[j]
            , r1 = p1.radius * p1.scale.x
            , r2 = p2.radius * p2.scale.x
            , pos1 = p1.position
            , pos2 = p2.position

          var targetDist = r1 + this.cellPadding
            , actualDist = Math.abs(pos1.distanceTo(pos2)) - r2
            , overlapAmt = targetDist - actualDist

          if (overlapAmt > 0) density += overlapAmt
          else capacity++

          repelForce.copy(pos2)
          repelForce.sub(pos1)
          mag = repelForce.length()

          // equidistance.
          if (Math.abs(pos1.distanceTo(pos2)) < (r1 + r2 + this.cellPadding)) {
            repelStrength = ((p1.radius + p2.radius) * 8) - mag
          } else
            repelStrength = ((p1.radius + p2.radius) * 2) - mag

          if ((repelStrength > 0) && (mag > 0)) {
            repelForce.multiplyScalar(repelStrength*0.0025 / mag)
            //repelForce.multiplyScalar(repelStrength*0.0035 / mag)

            p1.force.sub(repelForce)
            p2.force.add(repelForce)
          }
        }
      }

      // volatility controllers..
      if (density > 0) this.boundary++
      if (density < 25) {
        this.boundary = (this.boundary - this.radius) * 0.5 + this.radius
        this.equilibrium = true
      }

    }

    return
  }.bind(ps)

  return ps
}

exports.ParticleSystem = ParticleSystem

exports.create = function(radius) {
  return new ParticleSystem(radius)
}

