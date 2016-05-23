'use strict'

import path from 'path'

import Long from 'long'
import ProtoBuf from 'protobufjs'

import BasicSpan from './span'

let builder = ProtoBuf.loadProtoFile(path.join(__dirname, './state.proto'))
let TracerState = builder.build('TracerState')

class BinaryPropagator {
    constructor(tracer) {
        this._tracer = tracer
    }

    inject(span, carrier) {
        let parent = {
            trace_id: span.traceId, // eslint-disable-line
            span_id: span.spanId, // eslint-disable-line
            sampled: span.sampled,
            baggage_items: span.baggage, // eslint-disable-line
        }
        let state = new TracerState(parent)
        carrier.buffer = state.toBuffer()
    }

    join(operationName, carrier) {
        let parent
        try {
            let state = TracerState.decode(carrier.buffer).toRaw()
            parent = {
                traceId: state.trace_id,
                spanId: state.span_id,
                sampled: state.sampled,
                baggage: state.baggage_items,
            }
        } catch (err) {
            throw new Error('Trace corrupted, unable to parse binary carrier')
        }
        return new BasicSpan(this._tracer, {
            operationName,
            parent,
        })
    }
}

const PREFIX_TRACER_STATE = 'ot-tracer-'
const PREFIX_BAGGAGE = 'ot-baggage-'
const FIELD_NAME_TRACE_ID = PREFIX_TRACER_STATE + 'traceid'
const FIELD_NAME_SPAN_ID = PREFIX_TRACER_STATE + 'spanid'
const FIELD_NAME_SAMPLED = PREFIX_TRACER_STATE + 'sampled'
const FIELD_COUNT = 3

class TextMapPropagator {
    constructor(tracer, prefix = '') {
        this._tracer = tracer

        this.prefixBaggage = prefix + PREFIX_BAGGAGE
        this.fieldNameTraceId = prefix + FIELD_NAME_TRACE_ID
        this.fieldNameSpanId = prefix + FIELD_NAME_SPAN_ID
        this.fieldNameSampled = prefix + FIELD_NAME_SAMPLED
    }

    inject(span, carrier) {
        carrier[this.fieldNameTraceId] = span.traceId.toString()
        carrier[this.fieldNameSpanId] = span.spanId.toString()
        carrier[this.fieldNameSampled] = String(span.sampled)
        for (let key in span.baggage) {
            carrier[this.prefixBaggage + key] = span.baggage[key]
        }
    }

    join(operationName, carrier) {
        let parent = {
            baggage: {},
        }
        let count = 0
        for (let field in carrier) {
            if (field === this.fieldNameTraceId) {
                parent.traceId = Long.fromString(carrier[field], true)
                count += 1
            } else if (field === this.fieldNameSpanId) {
                parent.spanId = Long.fromString(carrier[field], true)
                count += 1
            } else if (field === this.fieldNameSampled) {
                if (carrier[field] !== 'true' &&
                    carrier[field] !== 'false') {
                    throw new Error('Trace corrupted, sampled should be type ' +
                                    `Boolean, got ${carrier[field]}`)
                }
                parent.sampled = Boolean(carrier[field])
                count += 1
            } else if (field.indexOf(this.prefixBaggage) === 0) {
                parent.baggage[field.slice(this.prefixBaggage.length)] =
                    carrier[field]
            }
        }
        if (count !== FIELD_COUNT) {
            throw new Error('Trace corrupted, ' +
                            'require traceId, spanId and sampled')
        }
        return new BasicSpan(this._tracer, {
            operationName,
            parent,
        })
    }
}

module.exports = {
    BinaryPropagator,
    TextMapPropagator,
}
