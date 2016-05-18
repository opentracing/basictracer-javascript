export class DefaultRecorder {
    /**
     * @param  {BasicSpan}
     *         Span to record, BasicSpan has following fields
     *         - `operationName` {String}
     *         - `startTime` {Number}
     *         - `duration` {Number}
     *         - `tags` {Object} Optional
     *         - `logs` {Array} Optional
     *         - `traceId` {Long} Fixed64 unique id represent by
     *             [long.js](https://github.com/dcodeIO/long.js) instance.
     *         - `spanId` {Long} Fixed64 unique id.
     *         - `parentId` {String}
     *         - `sampled` {Boolean}
     *         - `baggage` {Object} Default to empty object if no baggage in span.
     */
    record(span) { // eslint-disable-line

    }
}

export class DebuggingRecorder extends DefaultRecorder {
    record(span) {
        console.log(JSON.stringify({ // eslint-disable-line
            operationName: span.operationName,
            startTime: span.startTime,
            duration: span.duration,
            tags: span.tags,
            logs: span.logs,

            traceId: span.traceId.toString(16),
            spanId: span.spanId.toString(16),
            parentId: span.parentId.toString(16),
            sampled: span.sampled,
            baggage: span.baggage,
        }))
    }
}
