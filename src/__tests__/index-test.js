'use strict'

import tracer from '..'
tracer.configure()

const OPERATION_NAME = 'basictracer-test'
const ANOTHER_OPERATION_NAME = 'another-basictracer-test'

describe('Interface', () => {
    it('should create root span', () => {
        let rootSpan = tracer.startSpan({operationName: OPERATION_NAME})
        let imp = rootSpan.imp()
        should(imp.traceId).be.ok()
        should(imp.spanId).be.ok()
        should(imp.parentId.equals(imp.spanId)).be.ok()
        should(imp.sampled).be.type('boolean')
        should(imp.baggage).be.type('object')
    })

    it('should inject context into carrier', () => {
        let parentSpan = tracer.startSpan({operationName: OPERATION_NAME})
        let carrier = {}
        tracer.inject(parentSpan, tracer.FORMAT_TEXT_MAP, carrier)
        should(Object.keys(carrier).length).eql(3)
    })

    it('should join receving span', () => {
        // inject
        let parentSpan = tracer.startSpan({operationName: OPERATION_NAME})
        let carrier = {baggage: {key: 'value'}}
        tracer.inject(parentSpan, tracer.FORMAT_TEXT_MAP, carrier)

        // join
        let span = tracer.join(ANOTHER_OPERATION_NAME, tracer.FORMAT_TEXT_MAP,
                               carrier)

        let parentImp = parentSpan.imp()
        let imp = span.imp()
        should(imp.traceId.equals(parentImp.traceId)).be.ok()
        should(imp.spanId.equals(parentImp.spanId)).be.not.ok()
        should(imp.parentId.equals(parentImp.spanId)).be.ok()
        should(imp.sampled).eql(parentImp.sampled)
        should(imp.baggage).eql(parentImp.baggage)
    })

    it('should able to in process span creation', () => {
        let parentSpan = tracer.startSpan({operationName: OPERATION_NAME})
        let span = tracer.startSpan({
            operationName: ANOTHER_OPERATION_NAME,
            parent: parentSpan,
        })
        let parentImp = parentSpan.imp()
        let imp = span.imp()
        should(imp.traceId.equals(parentImp.traceId)).be.ok()
        should(imp.spanId.equals(parentImp.spanId)).not.be.ok()
        should(imp.parentId.equals(parentImp.spanId)).be.ok()
        should(imp.sampled).eql(parentImp.sampled)
        should(imp.baggage).be.type('object')
    })
})
