'use strict'

import BasicSpan from './span'
import {TextMapPropagator, BinaryPropagator} from './propagation'
import {DefaultSampler} from './sampler'
import {DefaultRecorder} from './recorder'

// Implement https://github.com/opentracing/opentracing-javascript/blob/master/src/tracer.js
export default class BasicTracer {
    /**
     * Constructs basic tracer instance with provided Sampler and Recorder
     * @param  {Object} options
     *         Optional associative array of fields.
     *         - `sampler` {Sampler} Optional object with `isSample` method, the
     *             method provided with current span as arguments, return
     *             Boolean value indicate whether should take current span
     *             as sample. See src/sample.js for example.
     *         - `recorder` {Recorder} Optional object with `record` method, the
     *             method take span and do whatever required to record a span.
     *             See src/recorder.js for example.
     *
     * @return {BasicTracer}
     */
    constructor({sampler, recorder} = {}) {
        this._sampler = sampler || new DefaultSampler()
        this._recorder = recorder || new DefaultRecorder()
        this._binaryPropagator = new BinaryPropagator(this)
        this._textPropagator = new TextMapPropagator(this)
        this._httpPropagator = new TextMapPropagator(this, 'x-')
    }

    setInterface(inf) {
        this._interface = inf
    }

    startSpan(fields) {
        // Interface or Implementation argument
        // https://github.com/opentracing/opentracing-javascript/pull/29
        if (fields.parent) {
            fields.parent = fields.parent.imp()
        }
        return new BasicSpan(this, {
            operationName: fields.operationName,
            parent: fields.parent,
            startTime: fields.startTime,
            tags: fields.tags,
        })
    }

    inject(span, format, carrier) {
        if (format === this._interface.FORMAT_TEXT_MAP) {
            this._textPropagator.inject(span, carrier)
        } else if (format === this._interface.FORMAT_BINARY) {
            this._binaryPropagator.inject(span, carrier)
        }
    }

    join(operationName, format, carrier) {
        let span
        if (format === this._interface.FORMAT_TEXT_MAP) {
            span = this._textPropagator.join(operationName, carrier)
        } else if (format === this._interface.FORMAT_BINARY) {
            span = this._binaryPropagator.join(operationName, carrier)
        }
        return span
    }

    _isSampled(span, parent) {
        return this._sampler.isSampled(span, parent)
    }
    _record(span) {
        this._recorder.record(span)
    }
}
