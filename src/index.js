'use strict'

import tracer from 'opentracing'
import Backend from './tracer'

tracer.configure = (options) => {
    tracer.initGlobalTracer(new Backend(options))
}

module.exports = tracer
