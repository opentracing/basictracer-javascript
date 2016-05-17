export default class Recorder {
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
