'use strict'

import tracer from 'opentracing'
import Backend from './tracer'
import {DefaultSampler} from './sampler'
import {DefaultRecorder, DebuggingRecorder} from './recorder'

tracer.configure = (options) => {
    tracer.initGlobalTracer(new Backend(options))
}

tracer.DefaultSampler = DefaultSampler
tracer.DefaultRecorder = DefaultRecorder
tracer.DebuggingRecorder = DebuggingRecorder
module.exports = tracer
