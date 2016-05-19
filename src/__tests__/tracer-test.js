'use strict'

import inf from 'opentracing'
import Tracer from '../tracer'

let tracer = new Tracer()
tracer.setInterface(inf)

const FORMAT_TEXT_MAP = inf.FORMAT_TEXT_MAP
const FORMAT_BINARY = inf.FORMAT_BINARY

const OPERATION_NAME = 'basictracer-test'
const ANOTHER_OPERATION_NAME = 'another-basictracer-test'

describe('Tracer', () => {
    it('should create root span', () => {
        let rootSpan = tracer.startSpan({operationName: OPERATION_NAME})
        should(rootSpan.traceId).be.ok()
        should(rootSpan.spanId).be.ok()
        should(rootSpan.parentId.equals(rootSpan.spanId)).be.ok()
        should(rootSpan.sampled).be.type('boolean')
        should(rootSpan.baggage).be.type('object')
    })

    it('should inject context into carrier', () => {
        let parentSpan = tracer.startSpan({operationName: OPERATION_NAME})
        let carrier = {}
        tracer.inject(parentSpan, FORMAT_TEXT_MAP, carrier)
        should(Object.keys(carrier).length).eql(3)
    })

    it('should join receving span', () => {
        // inject
        let parentSpan = tracer.startSpan({operationName: OPERATION_NAME})
        let carrier = {}
        tracer.inject(parentSpan, FORMAT_TEXT_MAP, carrier)

        // join
        let span = tracer.join(ANOTHER_OPERATION_NAME, FORMAT_TEXT_MAP,
                               carrier)
        should(span.traceId.equals(parentSpan.traceId)).be.ok()
        should(span.spanId.equals(parentSpan.spanId)).be.not.ok()
        should(span.parentId.equals(parentSpan.spanId)).be.ok()
        should(span.sampled).eql(parentSpan.sampled)
        should(span.baggage).eql(parentSpan.baggage)
    })

    it('should join binary span', () => {
        // inject
        let parentSpan = tracer.startSpan({operationName: OPERATION_NAME})
        let carrier = {}
        tracer.inject(parentSpan, FORMAT_BINARY, carrier)

        // join
        let span = tracer.join(ANOTHER_OPERATION_NAME, FORMAT_BINARY,
                               carrier)
        should(span.traceId.equals(parentSpan.traceId)).be.ok()
        should(span.spanId.equals(parentSpan.spanId)).be.not.ok()
        should(span.parentId.equals(parentSpan.spanId)).be.ok()
        should(span.sampled).eql(parentSpan.sampled)
        should(span.baggage).eql(parentSpan.baggage)
    })

    it('should able to in process span creation', () => {
        let parentSpan = tracer.startSpan({operationName: OPERATION_NAME})
        let span = tracer.startSpan({
            operationName: ANOTHER_OPERATION_NAME,
            parent: {
                imp() {
                    return parentSpan
                },
            },
        })
        should(span.traceId.equals(parentSpan.traceId)).be.ok()
        should(span.spanId.equals(parentSpan.spanId)).be.not.ok()
        should(span.parentId.equals(parentSpan.spanId)).be.ok()
        should(span.sampled).eql(parentSpan.sampled)
        should(span.baggage).be.type('object')
    })
})
