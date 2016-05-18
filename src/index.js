'use strict'

import tracer from 'opentracing'
import Backend from './tracer'
import {DefaultSampler} from './sampler'
import {DefaultRecorder, DebuggingRecorder} from './recorder'


// Little hack because interface don't expose a way to extend supported
// carrier format
tracer.FORMAT_HTTP_HEADER = 'http_header'

tracer.configure = (options) => {
    tracer.initGlobalTracer(new Backend(options))
}

tracer.DefaultSampler = DefaultSampler
tracer.DefaultRecorder = DefaultRecorder
tracer.DebuggingRecorder = DebuggingRecorder
module.exports = tracer
